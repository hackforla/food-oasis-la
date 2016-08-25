module Jekyll
  module LineReturnsToCommas
    def line_returns_to_commas(input)
    	# KUDOS: http://stackoverflow.com/questions/287713/how-do-i-remove-carriage-returns-with-ruby#answer-287810
    	input.gsub(/\r\n?/, ', ')
    end
  end
end

Liquid::Template.register_filter(Jekyll::LineReturnsToCommas)
