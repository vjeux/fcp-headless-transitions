__ZN28OZLiSegmentationStrokeFilterD0Ev:
00000000004253a0	pushq	%rbp
00000000004253a1	movq	%rsp, %rbp
00000000004253a4	pushq	%rbx
00000000004253a5	pushq	%rax
00000000004253a6	movq	%rdi, %rbx
00000000004253a9	leaq	0x43cda0(%rip), %rax
00000000004253b0	movq	%rax, (%rdi)
00000000004253b3	leaq	0x43ce7e(%rip), %rax
00000000004253ba	movq	%rax, 0x5f0(%rdi)
00000000004253c1	addq	$0x30, %rdi
00000000004253c5	callq	__ZN14OZRenderParamsD1Ev        ## OZRenderParams::~OZRenderParams()
00000000004253ca	leaq	0x43ce97(%rip), %rax
00000000004253d1	movq	%rax, (%rbx)
00000000004253d4	leaq	0x43cf75(%rip), %rax
00000000004253db	movq	%rax, 0x5f0(%rbx)
00000000004253e2	leaq	0x18(%rbx), %rdi
00000000004253e6	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000004253eb	leaq	0x43c306(%rip), %rsi
00000000004253f2	movq	%rbx, %rdi
00000000004253f5	callq	0x6dd842                        ## symbol stub for: __ZN13LiImageSourceD2Ev
00000000004253fa	leaq	__ZTV13PCShared_base(%rip), %rax ## vtable for PCShared_base
0000000000425401	addq	$0x10, %rax
0000000000425405	movq	%rax, 0x5f0(%rbx)
000000000042540c	movq	0x5f8(%rbx), %rdi
0000000000425413	testq	%rdi, %rdi
0000000000425416	je	0x42541d
0000000000425418	callq	0x6de4fc                        ## symbol stub for: __ZN18PC_Sp_counted_base12weak_releaseEv
000000000042541d	movq	%rbx, %rdi
0000000000425420	addq	$0x8, %rsp
0000000000425424	popq	%rbx
0000000000425425	popq	%rbp
0000000000425426	jmp	0x6dfc36                        ## symbol stub for: __ZdlPv
000000000042542b	movq	%rax, %rdi
000000000042542e	callq	___clang_call_terminate
0000000000425433	nopw	%cs:(%rax,%rax)
