__ZN8OZSpline13getNextVertexEPv:
000000000002fed8	pushq	%rbp
000000000002fed9	movq	%rsp, %rbp
000000000002fedc	pushq	%rbx
000000000002fedd	pushq	%rax
000000000002fede	movq	%rdi, %rbx
000000000002fee1	callq	__ZN8OZSpline13getVertexIterEPv ## OZSpline::getVertexIter(void*)
000000000002fee6	movq	0x30(%rbx), %rcx
000000000002feea	cmpq	%rcx, %rax
000000000002feed	je	0x2fefd
000000000002feef	addq	$0x8, %rax
000000000002fef3	cmpq	%rcx, %rax
000000000002fef6	je	0x2fefd
000000000002fef8	movq	(%rax), %rax
000000000002fefb	jmp	0x2feff
000000000002fefd	xorl	%eax, %eax
000000000002feff	addq	$0x8, %rsp
000000000002ff03	popq	%rbx
000000000002ff04	popq	%rbp
000000000002ff05	retq
