__ZN26PCException_ScopeUndefinedC1Ev:
000000000002d9ee	pushq	%rbp
000000000002d9ef	movq	%rsp, %rbp
000000000002d9f2	pushq	%rbx
000000000002d9f3	pushq	%rax
000000000002d9f4	movq	%rdi, %rbx
000000000002d9f7	callq	__ZN11PCExceptionC2Ev           ## PCException::PCException()
000000000002d9fc	leaq	0x11c32d(%rip), %rax
000000000002da03	movq	%rax, (%rbx)
000000000002da06	addq	$0x8, %rsp
000000000002da0a	popq	%rbx
000000000002da0b	popq	%rbp
000000000002da0c	retq
000000000002da0d	nop
