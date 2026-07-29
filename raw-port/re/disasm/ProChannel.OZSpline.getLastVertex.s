__ZN8OZSpline13getLastVertexEv:
000000000002fe9c	movq	0x18(%rdi), %rax
000000000002fea0	cmpq	%rax, 0x10(%rdi)
000000000002fea4	je	0x2feb0
000000000002fea6	pushq	%rbp
000000000002fea7	movq	%rsp, %rbp
000000000002feaa	movq	-0x8(%rax), %rax
000000000002feae	popq	%rbp
000000000002feaf	retq
000000000002feb0	xorl	%eax, %eax
000000000002feb2	retq
000000000002feb3	nop
