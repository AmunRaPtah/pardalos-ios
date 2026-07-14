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
WEB_SRC      = 'ios/Pardalos/web'
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
    WEB_DST="$TARGET_BUILD_DIR/#{target.product_build_phase&.build_files&.first&.file_ref&.real_path&.parent&.basename || '$UNLOCALIZED_RESOURCES_FOLDER_PATH'}/web"
    if [ -d "$WEB_SRC" ]; then
      rm -rf "$WEB_DST"
      cp -R "$WEB_SRC" "$WEB_DST"
      echo "Copied web assets (#{Dir.glob('ios/Pardalos/web/**/*').select { |f| File.file?(f) }.size} files)"
    fi
  SCRIPT
  # Move this phase to run BEFORE the "Sources" compile phase
  compile_phase_index = target.build_phases.index { |p| p.isa == 'PBXSourcesBuildPhase' }
  target.build_phases.move(phase, compile_phase_index) if compile_phase_index
  puts "✓ Added build phase '#{BUILD_PHASE_NAME}'"
end

# Also create a file group reference for convenience in Xcode
web_group = project.main_group['Pardalos']&.find_subpath('web', true) rescue nil
web_group ||= project.main_group.new_group('Web Assets', 'Pardalos/web')
if web_group
  web_group.source_tree = 'SOURCE_ROOT'
  web_group.path = 'Pardalos/web'
  puts "✓ Web group reference ready"
end

project.save
puts "✓ Project saved to #{PROJECT_PATH}"
