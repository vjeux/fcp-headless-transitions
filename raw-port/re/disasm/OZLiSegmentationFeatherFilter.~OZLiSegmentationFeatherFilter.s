__ZN29OZLiSegmentationFeatherFilterD0Ev:
0000000000425640	pushq	%rbp
0000000000425641	movq	%rsp, %rbp
0000000000425644	pushq	%rbx
0000000000425645	pushq	%rax
0000000000425646	movq	%rdi, %rbx
0000000000425649	leaq	0x43cea0(%rip), %rax
0000000000425650	movq	%rax, (%rdi)
0000000000425653	leaq	0x43cf7e(%rip), %rax
000000000042565a	movq	%rax, 0x5f0(%rdi)
0000000000425661	addq	$0x30, %rdi
0000000000425665	callq	__ZN14OZRenderParamsD1Ev        ## OZRenderParams::~OZRenderParams()
000000000042566a	leaq	0x43cf97(%rip), %rax
0000000000425671	movq	%rax, (%rbx)
0000000000425674	leaq	0x43d075(%rip), %rax
000000000042567b	movq	%rax, 0x5f0(%rbx)
0000000000425682	leaq	0x18(%rbx), %rdi
0000000000425686	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
000000000042568b	leaq	0x43c1ce(%rip), %rsi
0000000000425692	movq	%rbx, %rdi
0000000000425695	callq	0x6dd842                        ## symbol stub for: __ZN13LiImageSourceD2Ev
000000000042569a	leaq	__ZTV13PCShared_base(%rip), %rax ## vtable for PCShared_base
00000000004256a1	addq	$0x10, %rax
00000000004256a5	movq	%rax, 0x5f0(%rbx)
00000000004256ac	movq	0x5f8(%rbx), %rdi
00000000004256b3	testq	%rdi, %rdi
00000000004256b6	je	0x4256bd
00000000004256b8	callq	0x6de4fc                        ## symbol stub for: __ZN18PC_Sp_counted_base12weak_releaseEv
00000000004256bd	movq	%rbx, %rdi
00000000004256c0	addq	$0x8, %rsp
00000000004256c4	popq	%rbx
00000000004256c5	popq	%rbp
00000000004256c6	jmp	0x6dfc36                        ## symbol stub for: __ZdlPv
00000000004256cb	movq	%rax, %rdi
00000000004256ce	callq	___clang_call_terminate
00000000004256d3	nopw	%cs:(%rax,%rax)
