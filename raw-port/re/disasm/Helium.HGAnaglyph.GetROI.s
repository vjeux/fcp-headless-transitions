__ZN10HGAnaglyph6GetROIEP10HGRendereri6HGRect:
000000000006f830	cmpl	$0x2, %edx
000000000006f833	jl	0x6f844
000000000006f835	leaq	_HGRectNull(%rip), %rcx
000000000006f83c	movq	(%rcx), %rax
000000000006f83f	movq	0x8(%rcx), %rdx
000000000006f843	retq
000000000006f844	pushq	%rbp
000000000006f845	movq	%rsp, %rbp
000000000006f848	pushq	%r15
000000000006f84a	pushq	%r14
000000000006f84c	pushq	%rbx
000000000006f84d	pushq	%rax
000000000006f84e	movq	%r8, %rbx
000000000006f851	movq	%rcx, %r14
000000000006f854	movq	%rsi, %r15
000000000006f857	movq	%rdi, %rsi
000000000006f85a	movq	%r15, %rdi
000000000006f85d	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
000000000006f862	movq	%r15, %rdi
000000000006f865	movq	%rax, %rsi
000000000006f868	callq	__ZN10HGRenderer6GetDODEP6HGNode ## HGRenderer::GetDOD(HGNode*)
000000000006f86d	movq	%rax, %rdi
000000000006f870	movq	%rdx, %rsi
000000000006f873	movq	%r14, %rdx
000000000006f876	movq	%rbx, %rcx
000000000006f879	addq	$0x8, %rsp
000000000006f87d	popq	%rbx
000000000006f87e	popq	%r14
000000000006f880	popq	%r15
000000000006f882	popq	%rbp
000000000006f883	jmp	_HGRectIntersection
000000000006f888	nopl	(%rax,%rax)
