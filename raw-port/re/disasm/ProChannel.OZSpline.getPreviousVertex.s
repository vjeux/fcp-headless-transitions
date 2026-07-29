__ZN8OZSpline17getPreviousVertexEPv:
000000000002feb4	pushq	%rbp
000000000002feb5	movq	%rsp, %rbp
000000000002feb8	pushq	%rbx
000000000002feb9	pushq	%rax
000000000002feba	movq	%rdi, %rbx
000000000002febd	callq	__ZN8OZSpline13getVertexIterEPv ## OZSpline::getVertexIter(void*)
000000000002fec2	cmpq	0x28(%rbx), %rax
000000000002fec6	je	0x2fece
000000000002fec8	movq	-0x8(%rax), %rax
000000000002fecc	jmp	0x2fed0
000000000002fece	xorl	%eax, %eax
000000000002fed0	addq	$0x8, %rsp
000000000002fed4	popq	%rbx
000000000002fed5	popq	%rbp
000000000002fed6	retq
000000000002fed7	nop
