__ZN10PCCurveFitC1Ev:
000000000000b3e2	pushq	%rbp
000000000000b3e3	movq	%rsp, %rbp
000000000000b3e6	pushq	%rbx
000000000000b3e7	pushq	%rax
000000000000b3e8	movq	%rdi, %rbx
000000000000b3eb	xorl	%esi, %esi
000000000000b3ed	callq	__ZN11PCSingletonC2Ej           ## PCSingleton::PCSingleton(unsigned int)
000000000000b3f2	leaq	0x13d847(%rip), %rax
000000000000b3f9	movq	%rax, (%rbx)
000000000000b3fc	addq	$0x8, %rsp
000000000000b400	popq	%rbx
000000000000b401	popq	%rbp
000000000000b402	retq
000000000000b403	nop
