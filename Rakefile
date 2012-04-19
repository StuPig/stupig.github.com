require 'rubygems'
require 'rake'
require 'open-uri'
require 'multi_json'
require 'awesome_print'
require 'hashie'

# class Post < Hashie::Mash
#   def date
#     Time.parse(self['published'])
#   end

#   def filename
#     "_posts/#{date.strftime('%Y-%m-%d')}-#{slug}.html"
#   end

#   def slug
#     self["link"].split('/').last
#   end

#   def body
#     self.content.content
#   end
# end

# task :pull do
#   posts = MultiJson.decode(open("http://pipes.yahoo.com/pipes/pipe.run?_id=50f63f64c70a2a032bdaa5dbb3458224&_render=json").read)['value']['items'].map{|p| Post.new(p) }

#   posts.each do |p|
#     if File.exists?(p.filename)
#       puts "- Blog post at #{p.filename} exists, ignoring"
#     else
#       puts "- Creating blog post at #{p.filename}"
#       File.open(p.filename,'w') do |f|
#         f.write <<-YAML
# ---
# layout: post
# title: "#{p.title}"
# ---

# #{p.body}
# YAML
#       end
#     end
#   end
# end


# task :runwindows do
#     puts '* Changing the codepage'
#     'chcp 65001'
#     puts '* Running Jekyll'
#     'jekyll --server'
# end

SOURCE = "."
CONFIG = {
  'version' => "0.2.13",
  'themes' => File.join(SOURCE, "_includes", "themes"),
  'layouts' => File.join(SOURCE, "_layouts"),
  'posts' => File.join(SOURCE, "_posts"),
  'post_ext' => "md",
  'theme_package_version' => "0.1.0"
}

# Usage: rake post title="A Title" [date="2012-02-09"]
desc "Begin a new post in #{CONFIG['posts']}"
task :post do
  abort("rake aborted: '#{CONFIG['posts']}' directory not found.") unless FileTest.directory?(CONFIG['posts'])
  title = ENV["title"] || "new-post"
  # slug = title.downcase.strip.gsub(' ', '-').gsub(/[^\w-]/, '')
  slug = title.downcase.strip.gsub(' ', '-')
  begin
    date = (ENV['date'] ? Time.parse(ENV['date']) : Time.now).strftime('%Y-%m-%d')
  rescue Exception => e
    puts "Error - date format must be YYYY-MM-DD, please check you typed it correctly!"
    exit -1
  end
  filename = File.join(CONFIG['posts'], "#{date}-#{slug}.#{CONFIG['post_ext']}")
  if File.exist?(filename)
    abort("rake aborted!") if ask("#{filename} already exists. Do you want to overwrite?", ['y', 'n']) == 'n'
  end

  puts "Creating new post: #{filename}"
  open(filename, 'w') do |post|
    post.puts "---"
    post.puts "layout: post"
    post.puts "title: \"#{title.gsub(/-/,' ')}\""
    post.puts 'description: ""'
    post.puts "category: "
    post.puts "tags: []"
    post.puts "keywords: "
    post.puts "---"
  end
end # task :post

# Usage: rake page name="about.html"
# You can also specify a sub-directory path.
# If you don't specify a file extention we create an index.html at the path specified
desc "Create a new page."
task :page do
  name = ENV["name"] || "new-page.md"
  filename = File.join(SOURCE, "#{name}")
  filename = File.join(filename, "index.md") if File.extname(filename) == ""
  title = File.basename(filename, File.extname(filename)).gsub(/[\W\_]/, " ").gsub(/\b\w/){$&.upcase}
  if File.exist?(filename)
    abort("rake aborted!") if ask("#{filename} already exists. Do you want to overwrite?", ['y', 'n']) == 'n'
  end

  mkdir_p File.dirname(filename)
  puts "Creating new page: #{filename}"
  open(filename, 'w') do |post|
    post.puts "---"
    post.puts "layout: page"
    post.puts "title: \"#{title}\""
    post.puts 'description: ""'
    post.puts "keywords: "
    post.puts "---"
  end
end # task :page

desc "Launch preview environment"
task :preview do
  system "jekyll --auto --server"
end # task :preview

#Load custom rake scripts
Dir['_rake/*.rake'].each { |r| load r }
