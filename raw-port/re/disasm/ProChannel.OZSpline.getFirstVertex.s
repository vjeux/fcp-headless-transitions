__ZN8OZSpline14getFirstVertexEv:
000000000002fe86	movq	0x10(%rdi), %rax
000000000002fe8a	cmpq	0x18(%rdi), %rax
000000000002fe8e	je	0x2fe99
000000000002fe90	pushq	%rbp
000000000002fe91	movq	%rsp, %rbp
000000000002fe94	movq	(%rax), %rax
000000000002fe97	popq	%rbp
000000000002fe98	retq
000000000002fe99	xorl	%eax, %eax
000000000002fe9b	retq
