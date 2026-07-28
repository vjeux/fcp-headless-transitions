__ZN28OZShapeReparametrizedContourD1Ev:
00000000005d2fa0	pushq	%rbp
00000000005d2fa1	movq	%rsp, %rbp
00000000005d2fa4	pushq	%rbx
00000000005d2fa5	pushq	%rax
00000000005d2fa6	movq	%rdi, %rbx
00000000005d2fa9	movq	0x180(%rdi), %rdi
00000000005d2fb0	testq	%rdi, %rdi
00000000005d2fb3	je	0x5d2fc6
00000000005d2fb5	movq	(%rdi), %rax
00000000005d2fb8	callq	*0x8(%rax)
00000000005d2fbb	movq	$0x0, 0x180(%rbx)
00000000005d2fc6	movq	0x1c0(%rbx), %rdi
00000000005d2fcd	testq	%rdi, %rdi
00000000005d2fd0	je	0x5d2fde
00000000005d2fd2	movq	%rdi, 0x1c8(%rbx)
00000000005d2fd9	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
00000000005d2fde	movq	0x1a8(%rbx), %rdi
00000000005d2fe5	testq	%rdi, %rdi
00000000005d2fe8	je	0x5d2ff6
00000000005d2fea	movq	%rdi, 0x1b0(%rbx)
00000000005d2ff1	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
00000000005d2ff6	movq	0x190(%rbx), %rdi
00000000005d2ffd	testq	%rdi, %rdi
00000000005d3000	je	0x5d300e
00000000005d3002	movq	%rdi, 0x198(%rbx)
00000000005d3009	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
00000000005d300e	movq	%rbx, %rdi
00000000005d3011	addq	$0x8, %rsp
00000000005d3015	popq	%rbx
00000000005d3016	popq	%rbp
00000000005d3017	jmp	__ZN14OZShapeContourD2Ev        ## OZShapeContour::~OZShapeContour()
00000000005d301c	nopl	(%rax)
