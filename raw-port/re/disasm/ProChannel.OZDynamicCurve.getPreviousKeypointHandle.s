__ZN14OZDynamicCurve25getPreviousKeypointHandleERK6CMTimePvPS3_:
00000000000294a2	pushq	%rbp
00000000000294a3	movq	%rsp, %rbp
00000000000294a6	pushq	%r15
00000000000294a8	pushq	%r14
00000000000294aa	pushq	%rbx
00000000000294ab	pushq	%rax
00000000000294ac	movq	%rcx, %rbx
00000000000294af	movq	%rdx, %r14
00000000000294b2	movq	%rdi, %r15
00000000000294b5	addq	$0x8, %r15
00000000000294b9	movq	%r15, %rdi
00000000000294bc	movq	%rdx, %rsi
00000000000294bf	callq	__ZN8OZSpline13isValidHandleEPv ## OZSpline::isValidHandle(void*)
00000000000294c4	testb	%al, %al
00000000000294c6	je	0x294e3
00000000000294c8	movq	%r15, %rdi
00000000000294cb	movq	%r14, %rsi
00000000000294ce	callq	__ZN8OZSpline17getPreviousVertexEPv ## OZSpline::getPreviousVertex(void*)
00000000000294d3	testq	%rbx, %rbx
00000000000294d6	je	0x294db
00000000000294d8	movq	%rax, (%rbx)
00000000000294db	testq	%rax, %rax
00000000000294de	setne	%al
00000000000294e1	jmp	0x294e5
00000000000294e3	xorl	%eax, %eax
00000000000294e5	addq	$0x8, %rsp
00000000000294e9	popq	%rbx
00000000000294ea	popq	%r14
00000000000294ec	popq	%r15
00000000000294ee	popq	%rbp
00000000000294ef	retq
