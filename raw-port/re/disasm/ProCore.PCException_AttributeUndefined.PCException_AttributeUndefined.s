__ZN30PCException_AttributeUndefinedC1Ev:
000000000002e1b8	pushq	%rbp
000000000002e1b9	movq	%rsp, %rbp
000000000002e1bc	pushq	%rbx
000000000002e1bd	pushq	%rax
000000000002e1be	movq	%rdi, %rbx
000000000002e1c1	callq	__ZN11PCExceptionC2Ev           ## PCException::PCException()
000000000002e1c6	leaq	0x11bbe3(%rip), %rax
000000000002e1cd	movq	%rax, (%rbx)
000000000002e1d0	addq	$0x8, %rsp
000000000002e1d4	popq	%rbx
000000000002e1d5	popq	%rbp
000000000002e1d6	retq
000000000002e1d7	nop
