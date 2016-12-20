module Jekyll
  module PreventOrphans
    def prevent_orphans(input, number_of_words)
      words = input.split(' ')

      # If there aren’t enough words to match the request
      if words.length <= number_of_words
        number_of_words = words.length
      end

      # Wrap the target words in a span (so they can be styled to stay together on one line)
      words.insert(words.length - number_of_words, '<span class="avoid-break">')
      words.push('</span>')

      words.join(' ')
    end
  end
end

Liquid::Template.register_filter(Jekyll::PreventOrphans)
