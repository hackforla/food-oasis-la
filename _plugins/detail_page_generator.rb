# KUDOS: https://github.com/bighairydave/jekyll-datalist/blob/master/_plugins/generator.rb
module Jekyll

  class FoodSourceDetailPage < Page
    def initialize(site, base, dir, food_source)
      @site = site
      @base = base
      @dir = dir
      @name = 'index.html'
      self.process('index.html')
      self.read_yaml(File.join(base, '_layouts'), 'food-source-details.html')
      name_html  = food_source['name']
      name_words = food_source['name'].split(' ')

      # If there are at least three words
      if name_words.length >= 3

        # Wrap the last two words in a span (so they can be styled to stay together on one line)
        name_words.insert(name_words.length - 2, '<span>')
        name_words.push('</span>')

        name_html = name_words.join(' ')
      end

      self.data['name_html'] = name_html.gsub('&', '&amp;') # TODO: Consider escaping < and > as well
      self.data['title'] = food_source['name']
      self.data['food_source'] = food_source
    end
  end

  class FoodSourceDetailGenerator < Generator

    # This is duplicated in map/index.html
    def string_to_uri(string)
      return string.downcase
        .gsub("\s", "-")
        .gsub("/", "-")
        .gsub("&", "-")
        .gsub(".", "-")
        .gsub(":", "-")
        .gsub(",", "-")
        .gsub("+", "-")
        .gsub(/\r\n?/, '-')
        .gsub("'", "")
        .gsub("(", "")
        .gsub(")", "")
        .gsub("----", "-")
        .gsub("---", "-")
        .gsub("--", "-")
    end
    def get_uri(food_source)
      # Food sources (particularly super markets) sometimes share a name with each other, so add the latitude and longitude to make a unique URI.
      uri = "#{ string_to_uri(food_source['name'])}/#{ food_source['latitude'] }/#{ food_source['longitude'] }"
    end
    def generate_one(site, data_name, type, type_uri)
      site.data[data_name].each do | food_source |
        food_source['type']     = type
        food_source['type_uri'] = type_uri
        food_source['uri'] = get_uri(food_source)

        site.pages << FoodSourceDetailPage.new(site, "/", "#{ type_uri }/#{ food_source['uri'] }", food_source)
      end
    end
    def generate(site)
      if ENV['JEKYLL_ENV'] != 'development'
        generate_one(site, 'food-pantries',     'Food Pantry',      'food-pantry')
        generate_one(site, 'community-gardens', 'Community Garden', 'community-garden')
        generate_one(site, 'farmers-markets',   'Farmers Market',   'farmers-market')
        generate_one(site, 'supermarkets',      'Supermarket',      'supermarket')
        generate_one(site, 'grocery-stores',    'Grocery Store',    'grocery-store')
        generate_one(site, 'grocery-other',     'Store',            'store')
      end
    end
  end

end
