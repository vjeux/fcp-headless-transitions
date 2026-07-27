__ZN10PCCurveFit8FitCurveERNSt3__16vectorI9PCVector2IdENS0_9allocatorIS3_EEEES7_RS3_S8_d:
000000000000bae6	pushq	%rbp
000000000000bae7	movq	%rsp, %rbp
000000000000baea	pushq	%rbx
000000000000baeb	subq	$0x28, %rsp
000000000000baef	movq	%rcx, %r9
000000000000baf2	movq	%rdx, %rbx
000000000000baf5	movq	%rsi, %rdx
000000000000baf8	movq	%rdi, %rsi
000000000000bafb	movq	0x8(%rdx), %rax
000000000000baff	subq	(%rdx), %rax
000000000000bb02	sarq	$0x4, %rax
000000000000bb06	decq	%rax
000000000000bb09	movq	%r8, (%rsp)
000000000000bb0d	leaq	-0x20(%rbp), %rdi
000000000000bb11	xorl	%ecx, %ecx
000000000000bb13	movq	%rax, %r8
000000000000bb16	callq	__ZN10PCCurveFit8FitCubicERNSt3__16vectorI9PCVector2IdENS0_9allocatorIS3_EEEEmmRS3_S8_d ## PCCurveFit::FitCubic(std::__1::vector<PCVector2<double>, std::__1::allocator<PCVector2<double>>>&, unsigned long, unsigned long, PCVector2<double>&, PCVector2<double>&, double)
000000000000bb1b	movq	(%rbx), %rdi
000000000000bb1e	testq	%rdi, %rdi
000000000000bb21	je	0xbb2c
000000000000bb23	movq	%rdi, 0x8(%rbx)
000000000000bb27	callq	0xde6c0                         ## symbol stub for: __ZdlPv
000000000000bb2c	movaps	-0x20(%rbp), %xmm0
000000000000bb30	movups	%xmm0, (%rbx)
000000000000bb33	movq	-0x10(%rbp), %rax
000000000000bb37	movq	%rax, 0x10(%rbx)
000000000000bb3b	addq	$0x28, %rsp
000000000000bb3f	popq	%rbx
000000000000bb40	popq	%rbp
000000000000bb41	retq
