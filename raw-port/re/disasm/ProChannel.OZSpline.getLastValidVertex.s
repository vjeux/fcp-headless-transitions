__ZN8OZSpline18getLastValidVertexEPPvRK6CMTime:
000000000002dd5a	pushq	%rbp
000000000002dd5b	movq	%rsp, %rbp
000000000002dd5e	pushq	%r15
000000000002dd60	pushq	%r14
000000000002dd62	pushq	%r12
000000000002dd64	pushq	%rbx
000000000002dd65	subq	$0x80, %rsp
000000000002dd6c	movq	%rdx, %r14
000000000002dd6f	movq	%rsi, %rbx
000000000002dd72	movq	%rdi, %r15
000000000002dd75	testq	%rsi, %rsi
000000000002dd78	je	0x2dd81
000000000002dd7a	movq	$0x0, (%rbx)
000000000002dd81	cmpb	$0x1, 0x70(%r15)
000000000002dd86	jne	0x2dda8
000000000002dd88	movq	0x38(%r15), %rcx
000000000002dd8c	testq	%rcx, %rcx
000000000002dd8f	je	0x2de39
000000000002dd95	movb	$0x1, %al
000000000002dd97	testq	%rbx, %rbx
000000000002dd9a	je	0x2de47
000000000002dda0	movq	%rcx, (%rbx)
000000000002dda3	jmp	0x2de47
000000000002dda8	movq	0x18(%r15), %rax
000000000002ddac	cmpq	%rax, 0x10(%r15)
000000000002ddb0	je	0x2de45
000000000002ddb6	movq	-0x8(%rax), %rax
000000000002ddba	movq	0x20(%rax), %rcx
000000000002ddbe	movq	%rcx, -0x30(%rbp)
000000000002ddc2	movups	0x10(%rax), %xmm0
000000000002ddc6	movaps	%xmm0, -0x40(%rbp)
000000000002ddca	movq	0xa8(%r15), %rax
000000000002ddd1	cmpb	$0x0, (%rax)
000000000002ddd4	movl	$0x1, %eax
000000000002ddd9	movl	$0x64, %edx
000000000002ddde	cmovnel	%eax, %edx
000000000002dde1	leaq	-0x58(%rbp), %r12
000000000002dde5	movl	$0x1, %esi
000000000002ddea	movq	%r12, %rdi
000000000002dded	callq	0xaca92                         ## symbol stub for: _CMTimeMake
000000000002ddf2	movq	0x10(%r12), %rax
000000000002ddf7	movq	%rax, 0x28(%rsp)
000000000002ddfc	movups	(%r12), %xmm0
000000000002de01	movups	%xmm0, 0x18(%rsp)
000000000002de06	movq	-0x30(%rbp), %rax
000000000002de0a	movq	%rax, 0x10(%rsp)
000000000002de0f	movaps	-0x40(%rbp), %xmm0
000000000002de13	movups	%xmm0, (%rsp)
000000000002de17	leaq	-0x70(%rbp), %r12
000000000002de1b	movq	%r12, %rdi
000000000002de1e	callq	0xacad4                         ## symbol stub for: _PC_CMTimeSaferAdd
000000000002de23	movq	%r15, %rdi
000000000002de26	movq	%r12, %rsi
000000000002de29	movq	%rbx, %rdx
000000000002de2c	movq	%r14, %rcx
000000000002de2f	xorl	%r8d, %r8d
000000000002de32	callq	__ZN8OZSpline22getPreviousValidVertexERK6CMTimePPvS2_b ## OZSpline::getPreviousValidVertex(CMTime const&, void**, CMTime const&, bool)
000000000002de37	jmp	0x2de47
000000000002de39	testq	%rbx, %rbx
000000000002de3c	je	0x2de45
000000000002de3e	movq	$0x0, (%rbx)
000000000002de45	xorl	%eax, %eax
000000000002de47	addq	$0x80, %rsp
000000000002de4e	popq	%rbx
000000000002de4f	popq	%r12
000000000002de51	popq	%r14
000000000002de53	popq	%r15
000000000002de55	popq	%rbp
000000000002de56	retq
000000000002de57	nop
