__ZN28PCException_NoElementDefinedC1Ev:
000000000002da18	pushq	%rbp
000000000002da19	movq	%rsp, %rbp
000000000002da1c	pushq	%rbx
000000000002da1d	pushq	%rax
000000000002da1e	movq	%rdi, %rbx
000000000002da21	callq	__ZN11PCExceptionC2Ev           ## PCException::PCException()
000000000002da26	leaq	0x11c343(%rip), %rax
000000000002da2d	movq	%rax, (%rbx)
000000000002da30	addq	$0x8, %rsp
000000000002da34	popq	%rbx
000000000002da35	popq	%rbp
000000000002da36	retq
000000000002da37	nop
