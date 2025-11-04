import { supabaseAdmin } from '../supabaseClient';
import { Automation, AutomationAction } from '@/types/database';
import { postToSlack } from '../slackAPI';
import { createNotionPage } from '../notionAPI';
import { generateAISummary } from '../aiSummary';
import axios from 'axios';

export async function executeAutomation(
  automation: Automation,
  runId: string,
  userId: string
) {
  const startTime = Date.now();
  
  try {
    console.log(`Executing automation: ${automation.name} (${automation.id})`);
    
    const results: any[] = [];
    
    // Execute actions in order
    for (const action of automation.actions) {
      const actionResult = await executeAction(action, userId, automation);
      results.push(actionResult);
      
      if (!actionResult.success) {
        throw new Error(`Action failed: ${actionResult.error}`);
      }
    }
    
    const duration = Date.now() - startTime;
    
    // Update run as successful
    await supabaseAdmin
      .from('automation_runs')
      .update({
        status: 'success',
        result: { actions: results },
        duration_ms: duration,
        completed_at: new Date().toISOString(),
      })
      .eq('id', runId);
    
    // Update automation stats
    await supabaseAdmin
      .from('automations')
      .update({
        last_run_at: new Date().toISOString(),
        total_runs: automation.total_runs + 1,
        success_count: automation.success_count + 1,
      })
      .eq('id', automation.id);
    
    console.log(`Automation completed successfully in ${duration}ms`);
    
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error(`Automation failed:`, error);
    
    // Update run as failed
    await supabaseAdmin
      .from('automation_runs')
      .update({
        status: 'failed',
        error: error.message,
        duration_ms: duration,
        completed_at: new Date().toISOString(),
      })
      .eq('id', runId);
    
    // Update automation stats
    await supabaseAdmin
      .from('automations')
      .update({
        last_run_at: new Date().toISOString(),
        total_runs: automation.total_runs + 1,
        failure_count: automation.failure_count + 1,
      })
      .eq('id', automation.id);
  }
}

async function executeAction(
  action: AutomationAction,
  userId: string,
  automation: Automation
): Promise<{ success: boolean; error?: string; data?: any }> {
  try {
    switch (action.type) {
      case 'send_slack':
        return await executeSendSlack(action, userId);
      
      case 'create_notion':
        return await executeCreateNotion(action, userId);
      
      case 'ai_summary':
        return await executeAISummary(action, userId);
      
      case 'webhook':
        return await executeWebhook(action, automation);
      
      case 'send_email':
        return await executeSendEmail(action, userId);
      
      default:
        return { success: false, error: `Unknown action type: ${action.type}` };
    }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

async function executeSendSlack(
  action: AutomationAction,
  userId: string
): Promise<{ success: boolean; error?: string; data?: any }> {
  const { message, channel } = action.config;
  
  if (!message) {
    return { success: false, error: 'Message is required' };
  }
  
  // Get user's Slack integration
  const { data: integration } = await supabaseAdmin
    .from('integrations')
    .select('slack_token, slack_channel_id')
    .eq('user_id', userId)
    .single();
  
  if (!integration?.slack_token) {
    return { success: false, error: 'Slack not connected' };
  }
  
  const targetChannel = channel || integration.slack_channel_id;
  
  try {
    await postToSlack(integration.slack_token, targetChannel, message);
    return { success: true, data: { channel: targetChannel } };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

async function executeCreateNotion(
  action: AutomationAction,
  userId: string
): Promise<{ success: boolean; error?: string; data?: any }> {
  const { title, content, database_id } = action.config;
  
  if (!title) {
    return { success: false, error: 'Title is required' };
  }
  
  // Get user's Notion integration
  const { data: integration } = await supabaseAdmin
    .from('integrations')
    .select('notion_token, notion_database_id')
    .eq('user_id', userId)
    .single();
  
  if (!integration?.notion_token) {
    return { success: false, error: 'Notion not connected' };
  }
  
  const targetDatabase = database_id || integration.notion_database_id;
  
  try {
    await createNotionPage(
      integration.notion_token,
      targetDatabase,
      title,
      content || ''
    );
    return { success: true, data: { database: targetDatabase } };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

async function executeAISummary(
  action: AutomationAction,
  userId: string
): Promise<{ success: boolean; error?: string; data?: any }> {
  const { days = 1, include_stats = true } = action.config;
  
  try {
    // Get recent activities
    const { data: activities } = await supabaseAdmin
      .from('activities')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false });
    
    if (!activities || activities.length === 0) {
      return { success: false, error: 'No activities found' };
    }
    
    // Generate AI summary
    const summaryText = await generateAISummary({
      commits: activities.filter(a => a.type === 'commit'),
      prs: activities.filter(a => a.type === 'pr'),
      meetings: activities.filter(a => a.type === 'meeting'),
    });
    
    // Save summary
    await supabaseAdmin
      .from('summaries')
      .insert({
        user_id: userId,
        date: new Date().toISOString().split('T')[0],
        summary: summaryText,
        highlights: [],
        stats: include_stats ? { activities: activities.length } : null,
      });
    
    return { success: true, data: { summary: summaryText } };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

async function executeWebhook(
  action: AutomationAction,
  automation: Automation
): Promise<{ success: boolean; error?: string; data?: any }> {
  const { url, method = 'POST', headers = {}, body } = action.config;
  
  if (!url) {
    return { success: false, error: 'Webhook URL is required' };
  }
  
  try {
    const response = await axios({
      method,
      url,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      data: body || {
        automation_id: automation.id,
        automation_name: automation.name,
        timestamp: new Date().toISOString(),
      },
      timeout: 30000,
    });
    
    return { 
      success: true, 
      data: { 
        status: response.status,
        response: response.data 
      } 
    };
  } catch (error: any) {
    return { 
      success: false, 
      error: error.response?.data?.message || error.message 
    };
  }
}

async function executeSendEmail(
  action: AutomationAction,
  userId: string
): Promise<{ success: boolean; error?: string; data?: any }> {
  const { to, subject, body } = action.config;
  
  if (!to || !subject || !body) {
    return { success: false, error: 'Email requires to, subject, and body' };
  }
  
  // TODO: Implement email sending (using SendGrid, Resend, etc.)
  // For now, just log it
  console.log('Email would be sent:', { to, subject, body });
  
  return { 
    success: true, 
    data: { message: 'Email sending not yet implemented' } 
  };
}
