# Team Features Guide 👥

A comprehensive guide to LoopTask's team collaboration features.

---

## 🎯 Overview

LoopTask's team features enable organizations to collaborate effectively, track progress, and maintain healthy competition through gamification.

---

## 📍 Navigation

### Accessing Team Features

1. **From Dashboard**: Click "Team" in the sidebar
2. **Expandable Menu**: Click to reveal sub-sections:
   - Overview
   - Leaderboard
   - Goals & OKRs

### Routes

```
/dashboard/team              → Team Overview
/dashboard/team/leaderboard  → Competitive Rankings
/dashboard/team/goals        → Goals & OKRs
```

---

## 👥 Team Overview

### What You'll See

**Team Statistics (Top Cards)**
- Total team members
- Combined commits
- Total pull requests
- Average productivity score

**Team Members Grid**
- Member cards with:
  - Avatar with online/offline status
  - Name and email
  - Role badge (Owner/Admin/Member)
  - Individual stats (commits, PRs, score)
  - Action menu

**Recent Team Activity**
- Real-time activity feed
- Color-coded by activity type
- Relative timestamps

### Actions Available

**Invite Members**
1. Click "Invite Member" button
2. Enter email address
3. Select role (Admin/Member)
4. Send invitation

**View Member Details**
- Click on member card
- See detailed statistics
- View activity history

---

## 🏆 Leaderboard

### Features

**Time Range Selection**
- Week: Last 7 days
- Month: Last 30 days
- All: All-time rankings

**Podium Display (Top 3)**
- 🥇 1st Place: Gold trophy, largest avatar, pulsing animation
- 🥈 2nd Place: Silver medal, medium avatar
- 🥉 3rd Place: Bronze medal, medium avatar

**Full Rankings Table**
Shows for each member:
- Rank position
- Previous rank (for comparison)
- Commits count
- Pull requests count
- Code reviews count
- Day streak (consecutive active days)
- Overall score
- Trend indicator (↑ up, ↓ down, — same)
- Score change

**Achievement Badges**
- Most Commits
- Most PRs
- Longest Streak

### How Rankings Work

**Score Calculation**
```
Score = (Commits × 1) + (PRs × 3) + (Reviews × 2) + (Streak × 0.5)
```

**Ranking Factors**
1. Overall productivity score
2. Consistency (streak)
3. Quality (PR reviews)
4. Quantity (commits)

**Trend Indicators**
- 📈 Trending Up: Score increased
- 📉 Trending Down: Score decreased
- ➖ Stable: No change

---

## 🎯 Goals & OKRs

### What are OKRs?

**OKR = Objectives and Key Results**
- **Objective**: The goal you want to achieve
- **Key Results**: Measurable outcomes that indicate success

### Goal Types

1. **Quarterly**: 3-month objectives
2. **Monthly**: 30-day goals
3. **Ongoing**: Continuous improvement goals

### Goal Status

- 🟢 **On Track**: Progress ≥ 80%
- 🟡 **At Risk**: Progress 50-79%
- 🔴 **Off Track**: Progress < 50%
- 🔵 **Completed**: 100% done

### Creating a Goal

1. Click "Create Goal" button
2. Fill in details:
   - **Title**: Short, descriptive name
   - **Description**: What you're trying to achieve
   - **Type**: Quarterly/Monthly/Ongoing
   - **Deadline**: Target completion date
   - **Owner**: Person responsible
3. Add Key Results (after creation)
4. Click "Create Goal"

### Managing Goals

**Edit Goal**
- Click edit icon on goal card
- Update any field
- Save changes

**Delete Goal**
- Click delete icon
- Confirm deletion
- Goal is removed

**Track Progress**
- Progress updates automatically
- Based on key results completion
- Visual progress bar shows status

### Key Results

**What They Are**
- Specific, measurable outcomes
- Multiple per goal (typically 3-5)
- Each has own progress tracking

**Example Goal with Key Results**

```
Goal: Improve Code Quality
├─ Key Result 1: Achieve 80% test coverage (45% done)
├─ Key Result 2: Reduce code duplication by 30% (20% done)
└─ Key Result 3: Fix all critical bugs (70% done)
```

---

## 👤 Roles & Permissions

### Owner

**Full Access**
- ✅ View all data
- ✅ Invite/remove members
- ✅ Assign roles
- ✅ Create/edit/delete goals
- ✅ Manage workspace settings
- ✅ Delete workspace

### Admin

**Management Access**
- ✅ View all data
- ✅ Invite members
- ✅ Create/edit/delete goals
- ✅ Manage team settings
- ❌ Cannot remove Owner
- ❌ Cannot delete workspace

### Member

**Contributor Access**
- ✅ View team data
- ✅ View leaderboard
- ✅ View goals
- ✅ Update own profile
- ❌ Cannot invite members
- ❌ Cannot manage goals
- ❌ Cannot change settings

---

## 🎮 Gamification Elements

### Leaderboard Competition

**How to Climb the Ranks**
1. **Commit Regularly**: Daily commits boost score
2. **Open PRs**: Pull requests worth 3x commits
3. **Review Code**: Help teammates, earn points
4. **Maintain Streak**: Consecutive days multiply score
5. **Stay Active**: Consistent activity = higher rank

### Achievements

**Types of Achievements**
- 🏆 Most Commits: Highest commit count
- 🎯 Most PRs: Most pull requests
- 🔥 Longest Streak: Consecutive active days
- ⭐ Top Reviewer: Most code reviews
- 👑 Team MVP: Highest overall score

### Streaks

**What is a Streak?**
- Consecutive days with activity
- Resets if you miss a day
- Shown with 🔥 fire icon

**Streak Benefits**
- Multiplies your score
- Shows consistency
- Motivates daily activity
- Visible on leaderboard

---

## 📊 Team Analytics

### Metrics Tracked

**Individual Metrics**
- Commits per day/week/month
- Pull requests opened/merged
- Code reviews completed
- Lines of code written
- Languages used
- Active days
- Productivity score

**Team Metrics**
- Total team commits
- Total pull requests
- Average response time
- Team productivity score
- Goal completion rate
- Member activity rate

### Using Analytics

**Identify Trends**
- Who's most active?
- What's the team velocity?
- Are goals on track?
- Where are bottlenecks?

**Make Decisions**
- Redistribute workload
- Recognize top performers
- Address at-risk goals
- Plan capacity

---

## 💡 Best Practices

### For Team Leads

1. **Set Clear Goals**: Use SMART criteria
2. **Regular Check-ins**: Review progress weekly
3. **Recognize Achievement**: Celebrate wins
4. **Balance Workload**: Monitor individual metrics
5. **Encourage Collaboration**: Promote code reviews

### For Team Members

1. **Stay Consistent**: Maintain your streak
2. **Review Code**: Help teammates grow
3. **Update Progress**: Keep goals current
4. **Communicate**: Use activity feed
5. **Compete Healthily**: Leaderboard is for fun

### For Goal Setting

1. **Be Specific**: Clear, measurable outcomes
2. **Set Deadlines**: Time-bound objectives
3. **Break Down**: Multiple key results
4. **Track Progress**: Regular updates
5. **Adjust as Needed**: Flexibility is key

---

## 🚀 Quick Tips

### Maximize Your Score
- ✅ Commit daily (maintain streak)
- ✅ Open quality PRs (worth more points)
- ✅ Review teammate's code (bonus points)
- ✅ Stay active (consistency matters)

### Effective Goal Setting
- ✅ Start with 2-3 goals max
- ✅ Make key results measurable
- ✅ Set realistic deadlines
- ✅ Assign clear owners
- ✅ Review progress weekly

### Team Collaboration
- ✅ Check activity feed daily
- ✅ Celebrate team wins
- ✅ Help struggling members
- ✅ Share knowledge
- ✅ Maintain healthy competition

---

## 🔧 Troubleshooting

### Common Issues

**Can't See Team Page**
- Check if you're invited to a team
- Verify your role permissions
- Refresh the page

**Leaderboard Not Updating**
- Data updates every hour
- Check your integrations
- Verify GitHub connection

**Goals Not Saving**
- Check required fields
- Verify deadline format
- Ensure you have permissions

**Invite Not Working**
- Verify email address
- Check role selection
- Ensure you're Admin/Owner

---

## 📞 Support

### Need Help?

- 📧 Email: support@looptask.com
- 💬 Discord: [Join community](https://discord.gg/looptask)
- 📖 Docs: [docs.looptask.com](https://docs.looptask.com)
- 🐛 Issues: [GitHub Issues](https://github.com/looptask/issues)

---

## 🎉 Get Started

Ready to collaborate with your team?

1. Navigate to `/dashboard/team`
2. Invite your first team member
3. Create your first goal
4. Start competing on the leaderboard!

**Happy collaborating! 🚀**

---

*Last Updated: October 28, 2025*
*Version: 4.0*
