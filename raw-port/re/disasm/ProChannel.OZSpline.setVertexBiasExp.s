__ZN8OZSpline16setVertexBiasExpEPvdRK6CMTime:
000000000003c8b2	pushq	%rbp
000000000003c8b3	movq	%rsp, %rbp
000000000003c8b6	pushq	%r15
000000000003c8b8	pushq	%r14
000000000003c8ba	pushq	%r12
000000000003c8bc	pushq	%rbx
000000000003c8bd	subq	$0x20, %rsp
000000000003c8c1	movq	%rdx, %rbx
000000000003c8c4	movq	%rsi, %r14
000000000003c8c7	movq	%rdi, %r15
000000000003c8ca	callq	0xacee2                         ## symbol stub for: _exp
000000000003c8cf	movsd	%xmm0, -0x28(%rbp)
000000000003c8d4	xorl	%eax, %eax
000000000003c8d6	leaq	-0x38(%rbp), %rsi
000000000003c8da	movq	%rax, (%rsi)
000000000003c8dd	leaq	-0x30(%rbp), %r12
000000000003c8e1	movq	%rax, (%r12)
000000000003c8e5	movq	%r15, %rdi
000000000003c8e8	movq	%rbx, %rdx
000000000003c8eb	callq	__ZN8OZSpline19getFirstValidVertexEPPvRK6CMTime ## OZSpline::getFirstValidVertex(void**, CMTime const&)
000000000003c8f0	movq	%r15, %rdi
000000000003c8f3	movq	%r12, %rsi
000000000003c8f6	movq	%rbx, %rdx
000000000003c8f9	callq	__ZN8OZSpline18getLastValidVertexEPPvRK6CMTime ## OZSpline::getLastValidVertex(void**, CMTime const&)
000000000003c8fe	cmpb	$0x0, 0x90(%r15)
000000000003c906	jne	0x3c928
000000000003c908	cmpq	$0x0, -0x38(%rbp)
000000000003c90d	je	0x3c916
000000000003c90f	cmpq	$0x0, -0x30(%rbp)
000000000003c914	jne	0x3c928
000000000003c916	movq	0xa0(%r15), %rax
000000000003c91d	testq	%rax, %rax
000000000003c920	je	0x3c948
000000000003c922	cmpb	$0x1, 0x38(%rax)
000000000003c926	jne	0x3c948
000000000003c928	movq	(%r14), %rax
000000000003c92b	movq	%r14, %rdi
000000000003c92e	movsd	-0x28(%rbp), %xmm0
000000000003c933	movq	%rbx, %rsi
000000000003c936	callq	*0x30(%rax)
000000000003c939	movb	$0x1, %al
000000000003c93b	addq	$0x20, %rsp
000000000003c93f	popq	%rbx
000000000003c940	popq	%r12
000000000003c942	popq	%r14
000000000003c944	popq	%r15
000000000003c946	popq	%rbp
000000000003c947	retq
000000000003c948	xorl	%eax, %eax
000000000003c94a	jmp	0x3c93b
