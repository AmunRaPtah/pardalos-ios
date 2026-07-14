#!/usr/bin/env ruby
# ──────────────────────────────────────────────────────────────────
# Add a "Copy Web Assets" shell-script build phase to the Xcode
# project. This runs at build time and copies the entire web/ dir
# into the .app bundle so the WebView can load it locally.
# ──────────────────────────────────────────────────────────────────
# Run from the repo root (where ios/ lives) after `expo prebuild`.
# Requires the xcodeproj Ruby gem (pre-installed on macOS runners).
# ──────────────────────────────────────────────────────────────────

require 'xcodeproj'

PROJECT_PATH = 'ios/Pardalos.xcodeproj'
BUILD_PHASE_NAME = 'Copy Web Assets'

project = Xcodeproj::Project.open(PROJECT_PATH)
target = project.targets.first

# Check if the build phase already exists — skip if so
existing = target.shell_script_build_phases.find { |p| p.name == BUILD_PHASE_NAME }
if existing
  puts "✓ Build phase '#{BUILD_PHASE_NAME}' already exists — skipping"
else
  phase = target.new_shell_script_build_phase(BUILD_PHASE_NAME)
  phase.shell_script = <<~SCRIPT
    set -e
    WEB_SRC="$SRCROOT/Pardalos/web"
    WEB_DST="$TARGET_BUILD_DIR/$UNLOCALIZED_RESOURCES_FOLDER_PATH/web"
    if [ -d "$WEB_SRC" ]; then
      rm -rf "$WEB_DST"
      ditto "$WEB_SRC" "$WEB_DST"
      echo "Copied $(find "$WEB_DST" -type f | wc -l) web assets into bundle"
    else
      echo "WARNING: Web assets not found at $WEB_SRC"
    fi
  SCRIPT
  # Move this phase to run BEFORE the "Copy Bundle Resources" phase
  resources_phase_index = target.build_phases.index { |p| p.isa == 'PBXResourcesBuildPhase' }
  target.build_phases.move(phase, resources_phase_index) if resources_phase_index
  puts "✓ Added build phase '#{BUILD_PHASE_NAME}'"
end

project.save
puts "✓ Project saved to #{PROJECT_PATH}"
