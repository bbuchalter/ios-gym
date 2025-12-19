# 🚀 Tutorial Mode Deployment Guide

## Quick Start - Get Students Learning in 5 Minutes!

This guide will help you deploy the student-friendly tutorial version of the IOS CLI Trainer.

---

## 📋 What You'll Need

- [ ] A computer with Node.js installed (version 14 or higher)
- [ ] Basic command line familiarity
- [ ] Internet connection

**OR**

- [ ] Just a web browser (for pre-built deployment)

---

## Option 1: Use the Tutorial Exercises (Recommended for Students)

The tutorial exercises (`exercises-tutorial.yaml`) provide more guidance and better progression for middle school students.

### Step 1: Install Dependencies

```bash
cd ios-practice
npm install
```

### Step 2: Build with Tutorial Exercises

```bash
# Copy tutorial exercises over the standard ones
cp exercises-tutorial.yaml exercises.yaml

# Build the application
npm run build
```

### Step 3: Deploy

Choose one of these options:

#### Option A: Local Testing (Quickest)

```bash
# Start local server
npm start
```

Visit: `http://localhost:3000`

**Perfect for:**
- Testing before full deployment
- Computer lab with local installation
- Offline environments

#### Option B: GitHub Pages (Free, Recommended)

```bash
# Make sure your changes are committed
git add .
git commit -m "Deploy tutorial version"

# Deploy to GitHub Pages
git subtree push --prefix public origin gh-pages
```

Your site will be live at:
`https://[your-username].github.io/ios-practice/`

**Perfect for:**
- School-wide deployment
- Remote learning
- Take-home practice

#### Option C: Netlify (Free, Easiest)

1. Create account at netlify.com
2. Drag and drop the `public/` folder to Netlify
3. Get your custom URL instantly!

**Perfect for:**
- Quick deployment
- Custom domain names
- Continuous deployment

#### Option D: School Server

```bash
# Copy public folder to your web server
scp -r public/* username@schoolserver:/var/www/html/network-trainer/
```

**Perfect for:**
- Controlled environment
- No external dependencies
- School intranet only

---

## Option 2: Use Standard Exercises (Advanced Students)

Keep the original `exercises.yaml` for more advanced students or CyberPatriot competition prep.

```bash
# Just build with existing exercises
npm run build
npm start
```

---

## 📂 Files Overview

### What Gets Deployed

Only the `public/` directory gets deployed:

```
public/
├── index.html              # Main page
├── styles.css              # Styling (with progress tracker!)
├── exercises.json          # Your exercises (auto-generated)
├── commands.json           # Command grammar (auto-generated)
├── terminal-static.js      # Main application
└── [other .js files]       # Supporting modules
```

**Total size: ~85KB** - Super lightweight!

### Supporting Documents (Link to These)

```
STUDENT_GUIDE.md           # Student handbook
VISUAL_GUIDE.md            # Network diagrams and concepts
TEACHER_GUIDE.md           # Teacher instructions
```

**Tip:** Convert these to PDF and host alongside your app, or print for students!

---

## 🎨 Customization Options

### Change the Tutorial Exercises

Edit `exercises-tutorial.yaml`:

```yaml
- id: ex-001-my-custom-exercise
  title: "🌟 Level 1.1: My Custom Exercise"
  device_profile: L2_SWITCH
  instructions: |
    Your custom instructions here...
    
  requirements:
    - type: state_equals
      path: hostname
      value: "MySwitch"
  hints:
    - "Your helpful hints here"
```

Then rebuild:
```bash
npm run build
```

### Change the Look and Feel

Edit `public/styles.css`:

```css
/* Change the accent color */
:root {
  --accent-color: #007acc; /* Change to your school colors! */
}

/* Add your school logo */
header::before {
  content: url('your-logo.png');
}
```

### Add Your School Name

Edit `public/index.html`:

```html
<h1>Network Training - [Your School Name]</h1>
```

---

## 🎓 Classroom Setup Scenarios

### Scenario 1: Computer Lab (Local Installation)

**Setup:**
1. Install Node.js on teacher computer
2. Build the application
3. Share `public/` folder on network drive
4. Students open `public/index.html` from network drive

**Pros:**
- Works offline
- No external dependencies
- Full control

**Cons:**
- Requires network share setup
- Progress doesn't sync between computers

---

### Scenario 2: Cloud Deployment (GitHub Pages)

**Setup:**
1. Teacher deploys to GitHub Pages (one time)
2. Share URL with students
3. Students bookmark and use anywhere

**Pros:**
- Works from home
- Always latest version
- No installation needed

**Cons:**
- Requires internet
- Need GitHub account

---

### Scenario 3: Hybrid (Local + Cloud)

**Setup:**
1. Deploy to cloud for homework
2. Install locally for in-class (faster, offline)

**Pros:**
- Best of both worlds
- Redundancy

**Cons:**
- Two deployments to maintain

---

## 📊 Tracking Student Progress

### Built-in Progress Tracking

The application automatically tracks:
- ✅ Which exercises are completed
- 📊 Progress percentage
- 🏆 Achievement badges

**Stored in:** Browser localStorage (per computer)

### Export Progress (Manual)

Students can screenshot:
1. Progress panel showing completion
2. Each completed exercise status
3. Terminal showing final configuration

### Future: Teacher Dashboard

*Coming soon:* Central dashboard to track all students

---

## 🆘 Troubleshooting

### Problem: "Cannot find module"

```bash
# Solution: Reinstall dependencies
rm -rf node_modules
npm install
```

### Problem: "Build fails"

```bash
# Solution: Check YAML syntax
npm install -g js-yaml
js-yaml exercises-tutorial.yaml
```

### Problem: "Students can't access site"

**If local:**
- Check network file sharing is enabled
- Verify firewall isn't blocking

**If cloud:**
- Check URL is correct
- Verify GitHub Pages is enabled
- Wait 5-10 minutes after deployment

### Problem: "Progress isn't saving"

**Cause:** Browser localStorage disabled

**Solutions:**
- Enable cookies/storage in browser settings
- Use different browser
- Check if private/incognito mode (doesn't save)

### Problem: "Exercises won't complete"

**Common causes:**
1. Student forgot to save (write memory)
2. Typo in configuration
3. Wrong device mode

**Solution:** Use `show running-config` to check configuration

---

## 🔒 Security Considerations

### Is it safe to deploy publicly?

**Yes!** 
- No backend server = no database to hack
- Runs entirely in browser
- No user data collected
- No authentication needed

### Can students cheat?

The app validates device **state**, not just commands typed. Students must actually configure the device correctly.

However:
- They can view page source (but that's fine - learning tool!)
- They can share solutions (encourage collaboration!)
- Progress is per-browser (can reset)

**Recommendation:** Focus on learning, not just completion. Use oral assessments to verify understanding.

---

## 📈 Measuring Success

### Student Engagement Metrics

Track:
- ✅ How many students complete each exercise
- ⏱️ Average time per exercise
- 🔄 How many times they retry
- 💬 Questions asked (indicates engagement)

### Learning Outcomes

Assess:
- Can explain what commands do (not just type them)
- Can troubleshoot configuration issues
- Can apply concepts to new scenarios
- Show interest in networking careers

---

## 🎉 Going Live Checklist

Before sharing with students:

- [ ] Application builds successfully
- [ ] All 9 exercises load
- [ ] Tested on student computers/browsers
- [ ] STUDENT_GUIDE.md is accessible
- [ ] VISUAL_GUIDE.md is available
- [ ] Bookmarked/shared URL with students
- [ ] Created lesson plans (see TEACHER_GUIDE.md)
- [ ] Prepared introduction presentation
- [ ] Set up assessment rubric
- [ ] Informed IT department (if applicable)

---

## 🚀 Quick Deploy Script

Save this as `deploy-tutorial.sh`:

```bash
#!/bin/bash

echo "🎓 Deploying Tutorial Version..."

# Backup original exercises
cp exercises.yaml exercises-original.yaml

# Use tutorial exercises
cp exercises-tutorial.yaml exercises.yaml

# Build
echo "📦 Building..."
npm run build

# Deploy (choose one)
echo "🚀 Choose deployment:"
echo "1) Local (npm start)"
echo "2) GitHub Pages"
echo "3) Just build (manual deploy)"

read -p "Enter choice: " choice

case $choice in
  1)
    echo "Starting local server..."
    npm start
    ;;
  2)
    echo "Deploying to GitHub Pages..."
    git add public/
    git commit -m "Deploy tutorial version"
    git subtree push --prefix public origin gh-pages
    echo "✅ Deployed! Check your GitHub Pages URL"
    ;;
  3)
    echo "✅ Built! Deploy public/ folder manually"
    ;;
esac
```

Make it executable:
```bash
chmod +x deploy-tutorial.sh
./deploy-tutorial.sh
```

---

## 📞 Support Resources

### Documentation

- `STUDENT_GUIDE.md` - For students
- `TEACHER_GUIDE.md` - For teachers
- `VISUAL_GUIDE.md` - Concept diagrams
- `README.md` - Technical overview
- `QUICKSTART.md` - Quick setup

### Getting Help

**Technical Issues:**
- Check TROUBLESHOOTING.md
- Review error messages in browser console (F12)
- Search GitHub issues

**Teaching Questions:**
- See TEACHER_GUIDE.md lesson plans
- Join networking education communities
- Cisco NetAcad forums

---

## 🎯 Next Steps

After deployment:

1. **Week 1:** Introduce students to the platform
   - Show STUDENT_GUIDE.md
   - Complete Exercise 1 together
   - Assign Exercises 1-2 for practice

2. **Week 2-4:** Work through exercises
   - One exercise per class period
   - Use VISUAL_GUIDE.md for concepts
   - Encourage peer teaching

3. **Week 5+:** Advanced challenges
   - Speed competitions
   - Custom scenarios
   - CyberPatriot practice

4. **Ongoing:** Track and celebrate
   - Monitor completion rates
   - Celebrate achievements
   - Gather student feedback

---

## 🌟 Success Tips

1. **Start Simple**: Begin with Exercise 1, don't rush
2. **Visual Learning**: Use VISUAL_GUIDE.md diagrams extensively
3. **Celebrate Wins**: Recognize completed exercises
4. **Encourage Persistence**: Networking takes practice!
5. **Make it Relevant**: Connect to real-world scenarios
6. **Build Community**: Create a class networking club

---

## 📝 License & Sharing

This project is **open source** and **free to use**!

✅ You can:
- Use in any classroom
- Modify for your needs
- Share with other teachers
- Deploy anywhere

❌ Please don't:
- Sell access to the platform
- Remove attribution

---

**Ready to transform your students into network engineers?**

**Deploy now and watch them learn! 🚀**

---

## Questions?

Feel free to:
- Open an issue on GitHub
- Email project maintainer
- Share your success story!

**Happy Teaching! 👨‍🏫👩‍🏫**

