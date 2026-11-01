/**
 * Default CLI Commands Reference Data
 * Organized by category for easy browsing
 */

export const defaultCliCommands = [
  // ========================================================================
  // POWERSHELL
  // ========================================================================
  {
    name: 'List Directory (ls/Dir)',
    category: 'powershell',
    description: 'List files and directories with details',
    command: 'Get-ChildItem\n# Aliases: ls, dir, gci\n\n# With details:\nGet-ChildItem -Force\n\n# Recursive:\nGet-ChildItem -Recurse',
    tags: ['filesystem', 'basic', 'daily']
  },
  {
    name: 'Change Directory',
    category: 'powershell',
    description: 'Navigate the filesystem',
    command: 'Set-Location C:\\Path\\To\\Dir\n# Aliases: cd, sl, chdir\n\n# Go home:\nSet-Location ~\n\n# Go up:\nSet-Location ..',
    tags: ['filesystem', 'navigation', 'basic']
  },
  {
    name: 'Find Files by Name/Pattern',
    category: 'powershell',
    description: 'Search for files matching a pattern',
    command: 'Get-ChildItem -Recurse -Filter "*.log"\n\n# With regex:\nGet-ChildItem -Recurse | Where-Object { $_.Name -match "pattern" }\n\n# Find large files:\nGet-ChildItem -Recurse | Where-Object { $_.Length -gt 100MB }',
    tags: ['filesystem', 'search', 'filter']
  },
  {
    name: 'Search File Contents (grep)',
    category: 'powershell',
    description: 'Search inside files for text patterns',
    command: 'Select-String -Pattern "error" -Path *.log\n\n# Recursive with context:\nSelect-String -Pattern "error" -Path * -Recurse -Context 2,2\n\n# Case sensitive:\nSelect-String -Pattern "ERROR" -CaseSensitive',
    tags: ['search', 'text', 'logs']
  },
  {
    name: 'Process Management',
    category: 'powershell',
    description: 'List, find, and manage running processes',
    command: '# List all processes\nGet-Process\n\n# Find by name:\nGet-Process -Name "chrome"\n\n# Kill process:\nStop-Process -Name "notepad" -Force\n\n# By ID:\nStop-Process -Id 1234 -Force',
    tags: ['processes', 'system', 'management']
  },
  {
    name: 'Service Management',
    category: 'powershell',
    description: 'Control Windows services',
    command: '# List services\nGet-Service\n\n# Start/Stop/Restart:\nStart-Service -Name "wuauserv"\nStop-Service -Name "wuauserv"\nRestart-Service -Name "wuauserv"\n\n# Set startup type:\nSet-Service -Name "wuauserv" -StartupType Automatic',
    tags: ['services', 'system', 'admin']
  },
  {
    name: 'Network Info & Connections',
    category: 'powershell',
    description: 'View network adapters, connections, and test connectivity',
    command: '# Network adapters\nGet-NetAdapter\n\n# IP configuration\nGet-NetIPConfiguration\n\n# Active connections\nGet-NetTCPConnection | Where-Object { $_.State -eq "Established" }\n\n# Test connection\nTest-NetConnection -ComputerName "google.com" -Port 443',
    tags: ['network', 'diagnostics', 'connectivity']
  },
  {
    name: 'Disk Space & Usage',
    category: 'powershell',
    description: 'Check disk space and folder sizes',
    command: '# Drive space\nGet-PSDrive -PSProvider FileSystem\n\n# Folder size (recursive)\nGet-ChildItem -Recurse | Measure-Object -Property Length -Sum\n\n# Top 10 largest folders\ndu -d 1 | Sort-Object Size -Descending | Select-Object -First 10',
    tags: ['disk', 'storage', 'analysis']
  },
  {
    name: 'Environment Variables',
    category: 'powershell',
    description: 'View and manage environment variables',
    command: '# List all\nGet-ChildItem Env:\n\n# Get specific\n$env:PATH\n\n# Set (current session)\n$env:MY_VAR = "value"\n\n# Set (permanent - requires admin)\n[Environment]::SetEnvironmentVariable("MY_VAR", "value", "User")',
    tags: ['environment', 'variables', 'config']
  },
  {
    name: 'Install Software (Winget/Chocolatey/Scoop)',
    category: 'powershell',
    description: 'Package managers for Windows',
    command: '# Winget (built-in)\nwinget search "vscode"\nwinget install Microsoft.VisualStudioCode\n\n# Chocolatey\nchoco search vscode\nchoco install vscode\n\n# Scoop\nscoop search vscode\nscoop install vscode',
    tags: ['package-manager', 'install', 'software']
  },
  {
    name: 'System Info & Updates',
    category: 'powershell',
    description: 'Get system information and check for updates',
    command: '# System info\nGet-ComputerInfo\n\n# Windows version\n[System.Environment]::OSVersion.Version\n\n# Check updates\nGet-WindowsUpdate\n\n# Installed hotfixes\nGet-HotFix',
    tags: ['system', 'info', 'updates']
  },
  {
    name: 'Compress/Expand Archives',
    category: 'powershell',
    description: 'Work with ZIP and other archives',
    command: '# Create ZIP\nCompress-Archive -Path "C:\\Source\\*" -DestinationPath "backup.zip"\n\n# Extract ZIP\nExpand-Archive -Path "backup.zip" -DestinationPath "C:\\Extract"\n\n# With compression level\nCompress-Archive -Path * -DestinationPath "archive.zip" -CompressionLevel Optimal',
    tags: ['archive', 'zip', 'compression']
  },
  {
    name: 'Run as Administrator Check',
    category: 'powershell',
    description: 'Check if running with elevated privileges',
    command: '# Check elevation\n$principal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())\n$principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)\n\n# Re-run as admin (if not elevated)\nif (-not $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {\n  Start-Process powershell -Verb RunAs\n  exit\n}',
    tags: ['admin', 'elevation', 'security']
  },

  // ========================================================================
  // COMMAND PROMPT (CMD)
  // ========================================================================
  {
    name: 'Directory Navigation',
    category: 'cmd',
    description: 'Basic CMD directory commands',
    command: 'dir                    # List directory\ncd /d C:\\Path          # Change directory (with drive switch)\ncd ..                   # Go up one level\ncd \\                    # Go to root\npushd \\\\server\\share   # Map network drive temporarily',
    tags: ['filesystem', 'navigation', 'basic']
  },
  {
    name: 'File Operations',
    category: 'cmd',
    description: 'Copy, move, delete, and manage files',
    command: 'copy file.txt backup.txt\ncopy *.txt backup\\\n\nmove file.txt newname.txt\nmove *.log logs\\\n\ndel file.txt            # Delete file\ndel /q *.tmp            # Quiet delete\n\ndeltree /y folder       # Delete folder tree (old)\nrmdir /s /q folder      # Remove directory recursive',
    tags: ['filesystem', 'file-ops', 'basic']
  },
  {
    name: 'Network Commands',
    category: 'cmd',
    description: 'Classic CMD network troubleshooting',
    command: 'ipconfig /all                    # Full IP config\nipconfig /flushdns               # Flush DNS cache\nipconfig /release & ipconfig /renew\n\nping google.com                  # Test connectivity\nping -t google.com               # Continuous ping\n\ntracert google.com               # Trace route\nnslookup google.com              # DNS lookup\n\nnetstat -an                      # All connections\nnetstat -ano | findstr :80       # Find port 80',
    tags: ['network', 'diagnostics', 'classic']
  },
  {
    name: 'System Information',
    category: 'cmd',
    description: 'Get system info from CMD',
    command: 'systeminfo                    # Full system info\nsysteminfo | findstr /B /C:"OS Name" /C:"OS Version"\n\nwmic os get Caption,Version,BuildNumber\nwmic computersystem get TotalPhysicalMemory\nwmic cpu get Name,NumberOfCores,NumberOfLogicalProcessors\n\nver                             # Windows version\nhostname                        # Computer name',
    tags: ['system', 'info', 'wmic']
  },
  {
    name: 'Task/Process Management',
    category: 'cmd',
    description: 'Manage processes from CMD',
    command: 'tasklist                        # List all processes\ntasklist | findstr "chrome"       # Filter\n\ntaskkill /IM notepad.exe          # Kill by image name\ntaskkill /PID 1234 /F             # Kill by PID (force)\n\ntaskkill /FI "MEMUSAGE gt 500000" # Kill processes using >500MB',
    tags: ['processes', 'taskkill', 'management']
  },
  {
    name: 'Batch Script Helpers',
    category: 'cmd',
    description: 'Useful patterns for batch files',
    command: '@echo off\nsetlocal enabledelayedexpansion\n\n:: Loop through files\nfor %%f in (*.txt) do (\n  echo Processing %%f\n)\n\n:: Loop with counter\nfor /l %%i in (1,1,10) do (\n  echo Number: %%i\n)\n\n:: Conditional\nexist file.txt && echo Found\nif not exist file.txt (\n  echo Missing\n)\n\n:: Get current date/time\nfor /f "tokens=2 delims==" %%a in (\'wmic OS Get localdatetime /value\') do set "dt=%%a"\necho %dt:~0,4%-%dt:~4,2%-%dt:~6,2%',
    tags: ['batch', 'scripting', 'automation']
  },

  // ========================================================================
  // BASH / UNIX
  // ========================================================================
  {
    name: 'File System Navigation',
    category: 'bash',
    description: 'Essential directory navigation commands',
    command: 'pwd                              # Print working directory\nls -la                           # List all with details\nls -lh                           # Human readable sizes\ncd /path/to/dir                  # Change directory\ncd ~                             # Home directory\ncd -                             # Previous directory\npushd /path && popd              # Directory stack',
    tags: ['filesystem', 'navigation', 'basic']
  },
  {
    name: 'File Operations',
    category: 'bash',
    description: 'Copy, move, link, and manage files',
    command: 'cp file.txt backup.txt           # Copy\ncp -r dir/ backup/               # Copy recursive\nmv file.txt newname.txt          # Move/rename\nmv *.log logs/                   # Move multiple\nln -s /target linkname           # Symbolic link\nln /target hardlink              # Hard link\n\nrm file.txt                      # Remove file\nrm -rf dir/                      # Remove recursive force\nrm -i *.tmp                      # Interactive remove',
    tags: ['filesystem', 'file-ops', 'basic']
  },
  {
    name: 'Search & Find',
    category: 'bash',
    description: 'Find files and search content',
    command: '# Find files\nfind . -name "*.js"              # By name\nfind . -type f -size +100M       # Large files\nfind . -mtime -7                 # Modified last 7 days\nfind . -perm 777                 # World writable\n\n# Search content\ngrep "pattern" file.txt          # Basic\ngrep -r "pattern" .              # Recursive\ngrep -i "pattern" file.txt       # Case insensitive\ngrep -n "pattern" file.txt       # Line numbers\ngrep -A 3 -B 3 "pattern" file    # Context\n\n# Modern alternatives (ripgrep, fd)\nrg "pattern"                     # Fast grep\nfd "filename"                    # Fast find',
    tags: ['search', 'find', 'grep', 'text']
  },
  {
    name: 'Process Management',
    category: 'bash',
    description: 'View and control processes',
    command: 'ps aux                           # All processes\nps aux | grep "pattern"          # Filter\ntop                              # Interactive\ntop -u username                  # User processes\nhtop                             # Better top (install)\n\nkill 1234                        # Graceful kill\nkill -9 1234                     # Force kill\nkillall name                     # Kill by name\npkill -f "pattern"               # Kill by pattern\n\njobs                             # Background jobs\nfg %1                            # Foreground job\nbg %1                            # Background job\nnohup cmd &                      # Immune to hangup',
    tags: ['processes', 'management', 'signals']
  },
  {
    name: 'Disk Usage & Analysis',
    category: 'bash',
    description: 'Check disk space and analyze usage',
    command: 'df -h                            # Disk free space\ndu -h --max-depth=1              # Folder sizes\ndu -h . | sort -hr | head -20    # Largest folders\n\n# Find large files\nfind . -type f -size +100M -exec ls -lh {} \\;\n\n# NCurses disk usage (install ncdu)\nncdu\n\n# Clean package caches\nsudo apt clean                   # Debian/Ubuntu\nsudo dnf clean all               # Fedora\nsudo pacman -Sc                  # Arch',
    tags: ['disk', 'storage', 'analysis', 'cleanup']
  },
  {
    name: 'Network & Connectivity',
    category: 'bash',
    description: 'Network diagnostics and tools',
    command: 'ip a                             # Show interfaces\nip route                         # Routing table\n\nping -c 4 google.com             # Ping 4 times\nping -i 0.5 google.com           # Faster interval\n\ntraceroute google.com            # Trace route\nmtr google.com                   # Combined traceroute+ping\n\nnetstat -tulpn                   # Listening ports\nss -tulpn                        # Modern netstat\n\ncurl -I https://api.example.com  # Headers only\ncurl -v https://api.example.com  # Verbose\nwget -qO- https://api.example.com\n\nssh user@host                    # SSH\nssh -L 8080:localhost:80 user@host  # Port forwarding\nscp file.txt user@host:/path     # Secure copy\nrsync -avz src/ user@host:/dest/ # Sync',
    tags: ['network', 'ssh', 'diagnostics', 'transfer']
  },
  {
    name: 'Archive & Compression',
    category: 'bash',
    description: 'Work with tar, gzip, zip and more',
    command: '# tar.gz (most common)\ntar -czf archive.tar.gz dir/     # Create\ntar -xzf archive.tar.gz          # Extract\ntar -tzf archive.tar.gz          # List\n\n# tar.xz (better compression)\ntar -cJf archive.tar.xz dir/\ntar -xJf archive.tar.xz\n\n# zip\nzip -r archive.zip dir/\nunzip archive.zip\n\n# gzip single file\ngzip file.txt                    # Creates file.txt.gz\ngunzip file.txt.gz\n\n# Modern: zstd (fast, good ratio)\ntar -czf archive.tar.zst dir/\ntar -xzf archive.tar.zst',
    tags: ['archive', 'compression', 'tar', 'backup']
  },
  {
    name: 'Text Processing',
    category: 'bash',
    description: 'sed, awk, cut, sort, and text manipulation',
    command: '# sed - stream editor\nsed "s/old/new/g" file.txt       # Replace all\nsed -i "s/old/new/g" file.txt    # In-place\nsed -n "10,20p" file.txt         # Lines 10-20\nsed "/pattern/d" file.txt        # Delete matching lines\n\n# awk - field processing\nawk -F: "{print $1}" /etc/passwd  # First field\nawk "{sum+=$1} END {print sum}"   # Sum column\n\n# cut - extract columns\ncut -d: -f1 /etc/passwd          # First field\necho "a,b,c" | cut -d, -f2       # Second field\n\n# sort & uniq\nsort file.txt\nsort -u file.txt                 # Unique\nsort file.txt | uniq -c | sort -nr  # Count + sort\n\n# Modern: jq for JSON\njq ".items[] | .name" data.json\njq "map(select(.active))" data.json',
    tags: ['text', 'processing', 'sed', 'awk', 'json']
  },
  {
    name: 'Permissions & Ownership',
    category: 'bash',
    description: 'Manage file permissions and ownership',
    command: '# chmod - change permissions\nchmod 755 script.sh              # rwxr-xr-x\nchmod +x script.sh               # Add execute\nchmod u+rw,g+r,o-r file.txt      # Symbolic\nchmod -R 755 dir/                # Recursive\n\n# chown - change ownership\nchown user:group file.txt\nchown -R user:group dir/\n\n# Special permissions\nchmod 4755 script.sh             # Setuid\nchmod 2755 dir/                  # Setgid\nchmod +t dir/                    # Sticky bit\n\n# ACL (extended)\ngetfacl file.txt\nsetfacl -m u:user:rwx file.txt',
    tags: ['permissions', 'security', 'ownership']
  },
  {
    name: 'System Monitoring',
    category: 'bash',
    description: 'Monitor system resources',
    command: '# CPU & Memory\nfree -h                          # Memory usage\nwatch -n 1 free -h               # Live\n\ntop / htop / btop                # Process viewers\n\n# I/O\niostat -xz 1                     # Disk I/O\nwatch -n 1 iostat -xz 1\n\n# Network\nnethogs                          # Per-process bandwidth\niftop                            # Interface bandwidth\n\n# Logs\njournalctl -f                    # Follow systemd logs\njournalctl -u service-name       # Service logs\ndmesg -T | tail                  # Kernel messages\n\n# System load\nuptime\nw                                # Who + load',
    tags: ['monitoring', 'system', 'performance']
  },
  {
    name: 'Package Managers',
    category: 'bash',
    description: 'Common Linux package manager commands',
    command: '# apt (Debian/Ubuntu)\napt update && apt upgrade\napt install package\napt search keyword\napt show package\napt list --installed\n\n# dnf/yum (Fedora/RHEL)\ndnf update\ndnf install package\ndnf search keyword\n\n# pacman (Arch)\npacman -Syu                      # Update\npacman -S package                # Install\npacman -Ss keyword               # Search\npacman -Qs keyword               # Search installed\n\n# Homebrew (macOS/Linux)\nbrew update && brew upgrade\nbrew install package\nbrew search keyword\nbrew list\n\n# Flatpak\nflatpak install flathub org.app\nflatpak run org.app',
    tags: ['packages', 'install', 'update', 'managers']
  },

  // ========================================================================
  // GIT
  // ========================================================================
  {
    name: 'Git Basics',
    category: 'git',
    description: 'Essential daily Git commands',
    command: 'git init                              # Initialize repo\ngit clone <url>                       # Clone repository\ngit status                            # Working tree status\ngit add .                             # Stage all\ngit add -p                            # Interactive staging\ngit commit -m "message"               # Commit\ngit commit -am "message"              # Add modified + commit\ngit log --oneline -10                 # Recent commits\ngit log --graph --oneline --all       # Visual history',
    tags: ['basic', 'daily', 'workflow']
  },
  {
    name: 'Branching & Merging',
    category: 'git',
    description: 'Branch management and merging strategies',
    command: 'git branch                          # List branches\ngit branch -a                       # All (including remote)\ngit branch new-feature              # Create branch\ngit checkout new-feature            # Switch branch\ngit checkout -b new-feature         # Create + switch\ngit switch new-feature              # Modern switch\ngit switch -c new-feature           # Modern create+switch\n\n# Merge\ngit merge feature-branch            # Merge into current\n\n# Rebase\ngit rebase main                     # Rebase onto main\ngit rebase -i HEAD~3                # Interactive rebase\n\n# Delete branch\ngit branch -d feature               # Delete merged\ngit branch -D feature               # Force delete',
    tags: ['branching', 'merging', 'rebase', 'workflow']
  },
  {
    name: 'Remote & Sync',
    category: 'git',
    description: 'Work with remote repositories',
    command: 'git remote -v                       # List remotes\ngit remote add origin <url>         # Add remote\ngit fetch                             # Fetch changes\ngit pull                              # Fetch + merge\ngit pull --rebase                     # Fetch + rebase\ngit push                              # Push\ngit push -u origin branch             # Push + set upstream\ngit push --force-with-lease           # Safe force push\n\n# Tags\ngit tag v1.0.0                      # Create tag\ngit push --tags                     # Push tags',
    tags: ['remote', 'sync', 'push', 'pull']
  },
  {
    name: 'Undo & Fix Mistakes',
    category: 'git',
    description: 'Recover from common mistakes',
    command: '# Unstage files\ngit reset HEAD file.txt             # Unstage\ngit reset HEAD                      # Unstage all\n\n# Undo last commit (keep changes)\ngit reset --soft HEAD~1\n\n# Undo last commit (discard changes)\ngit reset --hard HEAD~1\n\n# Amend last commit\ngit commit --amend -m "new message"\ngit commit --amend --no-edit        # Keep message\n\n# Restore file to HEAD\ngit restore file.txt                # Modern\ngit checkout -- file.txt            # Legacy\n\n# Reflog - recover lost commits\ngit reflog\ngit reset --hard HEAD@{2}           # Go back in reflog',
    tags: ['undo', 'recovery', 'reset', 'restore']
  },
  {
    name: 'Stashing & Cleaning',
    category: 'git',
    description: 'Temporarily save changes and clean working directory',
    command: 'git stash                           # Stash changes\ngit stash push -m "WIP message"     # Named stash\ngit stash list                        # List stashes\ngit stash pop                         # Apply + drop\ngit stash apply                       # Apply (keep)\ngit stash drop                        # Delete stash\ngit stash clear                       # Delete all\n\n# Clean untracked files\ngit clean -n                          # Dry run\ngit clean -f                          # Force remove\ngit clean -fd                         # Include directories',
    tags: ['stash', 'clean', 'temporary']
  },
  {
    name: 'History & Inspection',
    category: 'git',
    description: 'Explore and understand repository history',
    command: 'git log --oneline --graph --all --decorate\n\n# Show commit details\ngit show HEAD                       # Latest\ngit show HEAD~3                     # 3 commits ago\ngit show <hash>                     # Specific commit\n\n# File history\ngit log --follow -p file.txt        # Full history with diffs\ngit blame file.txt                  # Line-by-line authors\n\n# Search history\ngit log --grep="pattern"            # Commit messages\ngit log -S "code"                   # Code changes (pickaxe)\ngit log --all --source --remotes    # All refs\n\n# Diff\ngit diff                            # Unstaged changes\ngit diff --staged                   # Staged changes\ngit diff HEAD~1..HEAD               # Last commit\n\ngit shortlog -sn                    # Contributors by commits',
    tags: ['history', 'inspection', 'diff', 'blame']
  },

  // ========================================================================
  // DOCKER
  // ========================================================================
  {
    name: 'Container Lifecycle',
    category: 'docker',
    description: 'Run, stop, and manage containers',
    command: '# Run container\ndocker run -d -p 8080:80 --name web nginx\n\n# Interactive\ndocker run -it --rm ubuntu bash\n\n# List\ndocker ps                    # Running\ndocker ps -a                 # All\n\n# Stop/Start/Restart\ndocker stop web\ndocker start web\ndocker restart web\n\n# Remove\ndocker rm web                # Stopped\ndocker rm -f web             # Force remove running\n\ndocker logs web              # View logs\ndocker logs -f web           # Follow logs\n\ndocker exec -it web bash     # Shell into running',
    tags: ['container', 'lifecycle', 'basic']
  },
  {
    name: 'Images',
    category: 'docker',
    description: 'Build, manage, and clean up images',
    command: '# Build\ndocker build -t myapp .\ndocker build -t myapp:v1.0 .\n\n# List\ndocker images\n\n# Pull/Push\ndocker pull nginx:alpine\ndocker push myapp:v1.0\n\n# Tag\ndocker tag myapp:latest myregistry.com/myapp:v1.0\n\n# Inspect\ndocker inspect nginx\n\n# History\ndocker history myapp\n\n# Cleanup\ndocker image prune           # Dangling\ndocker image prune -a        # All unused\ndocker system prune -a       # Everything',
    tags: ['images', 'build', 'registry', 'cleanup']
  },
  {
    name: 'Docker Compose',
    category: 'docker',
    description: 'Multi-container orchestration',
    command: '# Start\ndocker compose up -d             # Detached\ndocker compose up --build        # Rebuild\n\n# Stop/Down\ndocker compose down              # Stop + remove\ndocker compose down -v           # Include volumes\n\n# Logs\ndocker compose logs -f           # Follow all\ndocker compose logs -f web       # Specific service\n\n# Exec\ndocker compose exec web bash\n\n# Scale\ndocker compose up --scale web=3\n\n# Config\ndocker compose config            # Validate + view',
    tags: ['compose', 'orchestration', 'multi-container']
  },
  {
    name: 'Volumes & Networks',
    category: 'docker',
    description: 'Persistent storage and networking',
    command: '# Volumes\ndocker volume create mydata\ndocker volume ls\ndocker volume inspect mydata\ndocker volume rm mydata\n\n# Bind mounts\ndocker run -v /host/path:/container/path\n\n# Networks\ndocker network create mynet\ndocker network ls\ndocker network inspect mynet\n\n# Use network\ndocker run --network mynet nginx',
    tags: ['volumes', 'networks', 'storage', 'networking']
  },

  // ========================================================================
  // NODE.JS / NPM
  // ========================================================================
  {
    name: 'Package Management (npm)',
    category: 'node',
    description: 'npm commands for package management',
    command: '# Install\nnpm install                    # Install from package.json\nnpm install package            # Add dependency\nnpm install -D package         # Dev dependency\nnpm install -g package         # Global\n\n# Update\nnpm update                     # Update all\nnpm outdated                   # Check outdated\n\n# Remove\nnpm uninstall package\n\n# Scripts\nnpm run build                  # Run script\nnpm run                        # List scripts\n\n# Info\nnpm list                       # Installed packages\nnpm list -g --depth=0          # Global packages\nnpm audit                      # Security audit\nnpm audit fix                  # Auto-fix',
    tags: ['npm', 'packages', 'dependencies', 'scripts']
  },
  {
    name: 'Package Management (pnpm/yarn)',
    category: 'node',
    description: 'Alternative package managers',
    command: '# pnpm (fast, disk-efficient)\npnpm install\npnpm add package\npnpm add -D package\npnpm remove package\npnpm run build\npnpm outdated\n\n# yarn\nyarn install\nyarn add package\nyarn add -D package\nyarn remove package\nyarn build\nyarn upgrade',
    tags: ['pnpm', 'yarn', 'alternative', 'fast']
  },
  {
    name: 'Node.js Development',
    category: 'node',
    description: 'Run, debug, and manage Node.js applications',
    command: '# Run\nnode app.js\nnode --watch app.js            # Auto-reload (Node 18+)\n\n# Debug\nnode --inspect app.js\nnode --inspect-brk app.js\n\n# Environment\nNODE_ENV=production node app.js\n\n# Version management (nvm)\nnvm install 20\nnvm use 20\nnvm alias default 20\n\n# REPL\nnode                             # Interactive',
    tags: ['run', 'debug', 'nvm', 'environment']
  },

  // ========================================================================
  // PYTHON
  // ========================================================================
  {
    name: 'Virtual Environments',
    category: 'python',
    description: 'Create and manage isolated Python environments',
    command: '# venv (built-in)\npython -m venv venv\nsource venv/bin/activate        # Linux/macOS\nvenv\\Scripts\\activate          # Windows\n\ndeactivate                       # Exit venv\n\n# virtualenv (more features)\nvirtualenv venv\n\n# conda\nconda create -n myenv python=3.11\nconda activate myenv\nconda deactivate\nconda env list\n\n# poetry (modern)\npoetry new myproject\npoetry install\npoetry add requests\npoetry shell',
    tags: ['venv', 'conda', 'poetry', 'isolation']
  },
  {
    name: 'Package Management (pip)',
    category: 'python',
    description: 'Install and manage Python packages',
    command: '# Install\npip install package\npip install -r requirements.txt\npip install -e .                # Editable install\n\n# Upgrade\npip install --upgrade package\npip list --outdated\n\n# Freeze\npip freeze > requirements.txt\n\n# Uninstall\npip uninstall package\n\n# Search/info\npip search keyword\npip show package\n\n# Cache\npip cache purge',
    tags: ['pip', 'packages', 'requirements', 'dependencies']
  },
  {
    name: 'Python Development',
    category: 'python',
    description: 'Run, test, and debug Python code',
    command: '# Run\npython script.py\npython -m module\n\n# REPL\npython\nipython                        # Better REPL\n\n# Testing\npytest                           # Run tests\npytest -v                        # Verbose\npytest -k "test_name"            # Filter\npytest --cov                     # Coverage\n\n# Linting/Format\nblack .                          # Format\nruff check .                     # Lint (fast)\nmypy .                           # Type check\n\n# Debug\npython -m pdb script.py\npython -m debugpy --listen 5678 --wait-for-client script.py',
    tags: ['run', 'test', 'lint', 'debug', 'format']
  },

  // ========================================================================
  // CUSTOM / UTILITY
  // ========================================================================
  {
    name: 'SSH Key Management',
    category: 'custom',
    description: 'Generate and manage SSH keys',
    command: '# Generate new key\nssh-keygen -t ed25519 -C "email@example.com"\n\n# Start agent & add key\neval "$(ssh-agent -s)"\nssh-add ~/.ssh/id_ed25519\n\n# Copy public key to clipboard\ncat ~/.ssh/id_ed25519.pub | clip        # Windows\ncat ~/.ssh/id_ed25519.pub | pbcopy      # macOS\ncat ~/.ssh/id_ed25519.pub | xclip -sel clip  # Linux\n\n# Test connection\nssh -T git@github.com',
    tags: ['ssh', 'keys', 'github', 'git']
  },
  {
    name: 'GPG/PGP Encryption',
    category: 'custom',
    description: 'Encrypt, decrypt, and sign files',
    command: '# Generate key\ngpg --full-generate-key\n\n# List keys\ngpg --list-keys\ngpg --list-secret-keys\n\n# Export public key\ngpg --export -a "email@example.com" > public.key\n\n# Import key\ngpg --import public.key\n\n# Encrypt file\ngpg --encrypt --recipient "email@example.com" file.txt\n\n# Decrypt file\ngpg --decrypt file.txt.gpg > file.txt\n\n# Sign file\ngpg --sign file.txt\n\n# Verify signature\ngpg --verify file.txt.sig',
    tags: ['gpg', 'encryption', 'signing', 'security']
  },
  {
    name: 'Systemd Service Management',
    category: 'custom',
    description: 'Manage systemd services on Linux',
    command: '# Service control\nsudo systemctl start service\nsudo systemctl stop service\nsudo systemctl restart service\nsudo systemctl reload service\nsudo systemctl enable service\nsudo systemctl disable service\n\n# Status & logs\nsystemctl status service\njournalctl -u service -f\n\n# List\nsystemctl list-units --type=service\nsystemctl list-unit-files --state=enabled\n\n# Custom service example\n# /etc/systemd/system/myapp.service\n[Unit]\nDescription=My App\nAfter=network.target\n\n[Service]\nType=simple\nUser=myuser\nWorkingDirectory=/opt/myapp\nExecStart=/opt/myapp/venv/bin/python app.py\nRestart=on-failure\n\n[Install]\nWantedBy=multi-user.target',
    tags: ['systemd', 'services', 'linux', 'daemon']
  },
  {
    name: 'Cron / Scheduled Tasks',
    category: 'custom',
    description: 'Schedule recurring commands',
    command: '# Edit crontab\ncrontab -e\n\n# Crontab format:\n# * * * * * command\n# ┬ ┬ ┬ ┬ └─ Day of week (0-7)\n# ┬ ┬ ┬ └──── Month (1-12)\n# ┬ ┬ └────── Day of month (1-31)\n# ┬ └──────── Hour (0-23)\n# └────────── Minute (0-59)\n\n# Examples:\n0 2 * * * /path/to/backup.sh           # Daily at 2 AM\n*/15 * * * * /path/to/check.sh         # Every 15 min\n0 0 * * 0 /path/to/weekly.sh           # Weekly Sunday\n@reboot /path/to/startup.sh            # On boot\n\n# List\ncrontab -l\n\n# System-wide\n/etc/cron.d/myjob',
    tags: ['cron', 'scheduling', 'automation', 'linux']
  },
  {
    name: 'Windows Task Scheduler (PowerShell)',
    category: 'custom',
    description: 'Create scheduled tasks via PowerShell',
    command: '# Create basic task\n$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-File C:\\Scripts\\backup.ps1"\n$trigger = New-ScheduledTaskTrigger -Daily -At 2am\nRegister-ScheduledTask -TaskName "DailyBackup" -Action $action -Trigger $trigger\n\n# Run with highest privileges\n$principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest\nRegister-ScheduledTask -TaskName "AdminTask" -Action $action -Trigger $trigger -Principal $principal\n\n# List tasks\nGet-ScheduledTask | Where-Object { $_.TaskName -like "*Backup*" }\n\n# Enable/Disable\nEnable-ScheduledTask -TaskName "DailyBackup"\nDisable-ScheduledTask -TaskName "DailyBackup"\n\n# Remove\nUnregister-ScheduledTask -TaskName "DailyBackup" -Confirm:$false',
    tags: ['windows', 'task-scheduler', 'automation', 'powershell']
  }
];

// Category metadata for UI
export const cliCategories = [
  { id: 'powershell', name: 'PowerShell', icon: 'terminal', color: '#012456', description: 'Windows PowerShell commands' },
  { id: 'cmd', name: 'Command Prompt', icon: 'terminal', color: '#000000', description: 'Classic Windows CMD commands' },
  { id: 'bash', name: 'Bash/Unix', icon: 'terminal', color: '#4EAA25', description: 'Linux/macOS Bash commands' },
  { id: 'git', name: 'Git', icon: 'git-branch', color: '#F05032', description: 'Version control commands' },
  { id: 'docker', name: 'Docker', icon: 'docker', color: '#2496ED', description: 'Container management' },
  { id: 'node', name: 'Node.js', icon: 'nodejs', color: '#339933', description: 'JavaScript/Node.js tools' },
  { id: 'python', name: 'Python', icon: 'python', color: '#3776AB', description: 'Python development' },
  { id: 'custom', name: 'Custom', icon: 'tool', color: '#7C5CFF', description: 'Custom & utility commands' }
];

// Category icons (inline SVG)
export const categoryIcons = {
  powershell: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path></svg>`,
  cmd: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"></rect><path d="M8 10h12"></path><path d="M8 14h12"></path><path d="M8 18h7"></path></svg>`,
  bash: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path><path d="M12 2v20"></path></svg>`,
  git: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path><path d="M12 2v20"></path><circle cx="12" cy="12" r="3"></circle></svg>`,
  docker: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path><path d="M12 22V12"></path></svg>`,
  nodejs: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path><path d="M12 22V12"></path><circle cx="12" cy="12" r="3"></circle></svg>`,
  python: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><path d="M8 10s1.5-2 4-2 4 2 4 2"></path></svg>`,
  custom: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path><circle cx="12" cy="12" r="3"></circle></svg>`
};