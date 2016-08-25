module Jekyll
  module RemoveLineReturns
    def remove_line_returns(input)
    	# KUDOS: http://stackoverflow.com/questions/287713/how-do-i-remove-carriage-returns-with-ruby#answer-287810
    	input.gsub(/\r\n?/, ', ')
    end
  end
end

Liquid::Template.register_filter(Jekyll::RemoveLineReturns)
