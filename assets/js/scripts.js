$(function () {
	// sticky header
	var observer = new IntersectionObserver(
		function (entries) {
			// no intersection with screen
			if (0 === entries[0].intersectionRatio) {
				document.querySelector('#headerBar').classList.add('sticky');
			}

			// fully intersects with screen
			else if (1 === entries[0].intersectionRatio) {
				document.querySelector('#headerBar').classList.remove('sticky');
			}
		},
		{
			threshold: [0, 1],
		}
	);

	observer.observe(document.querySelector('#stickyMenuTop'));

	// masks
	var maskBehavior = function (val) {
			return val.replace(/\D/g, '').length === 11
				? '(00) 00000-0000'
				: '(00) 0000-00009';
		},
		options = {
			onKeyPress: function (val, e, field, options) {
				field.mask(maskBehavior.apply({}, arguments), options);
			},
		};
	$('.form-tel').mask(maskBehavior, options);
	$('.form-cep').mask('00000-000');

	// cep autofill
	$('#form-cep').on('focusout', function () {
		$.ajax({
			//O campo URL diz o caminho de onde virá os dados
			//É importante concatenar o valor digitado no CEP
			url: 'https://viacep.com.br/ws/' + $(this).val() + '/json/unicode/',
			//Aqui você deve preencher o tipo de dados que será lido,
			//no caso, estamos lendo JSON.
			dataType: 'json',
			//SUCESS é referente a função que será executada caso
			//ele consiga ler a fonte de dados com sucesso.
			//O parâmetro dentro da função se refere ao nome da variável
			//que você vai dar para ler esse objeto.
			success: function (resposta) {
				//Agora basta definir os valores que você deseja preencher
				//automaticamente nos campos acima.
				$('#form-endereco').val(resposta.logradouro);
				$('#form-complemento').val(resposta.complemento);
				$('#form-bairro').val(resposta.bairro);
				$('#form-cidade').val(resposta.localidade);
				$('#form-uf').val(resposta.uf);
				//Vamos incluir para que o Número seja focado automaticamente
				//melhorando a experiência do usuário
				$('#form-numero').focus();
			},
		});
	});

	// Get container offset
	offsetWidth();
	$(window).resize(function () {
		offsetWidth();
	});

	function offsetWidth() {
		var containerOffset = $('.container').offset().left;
		$('.header-offset').css('width', containerOffset);
	}

	// Fancybox
	Fancybox.bind();
});
