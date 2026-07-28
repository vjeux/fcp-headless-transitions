__ZN18LightingStyleLightD1Ev:
00000000001c4010	pushq	%rbp
00000000001c4011	movq	%rsp, %rbp
00000000001c4014	pushq	%rbx
00000000001c4015	pushq	%rax
00000000001c4016	movq	%rdi, %rbx
00000000001c4019	addq	$0x80, %rdi
00000000001c4020	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
00000000001c4025	movq	0x38(%rbx), %rdi
00000000001c4029	testq	%rdi, %rdi
00000000001c402c	je	0x1c4033
00000000001c402e	callq	0x6dda9a                        ## symbol stub for: __ZN13PCCFRefTraitsIP12CGColorSpaceE7releaseES1_
00000000001c4033	addq	$0x8, %rsp
00000000001c4037	popq	%rbx
00000000001c4038	popq	%rbp
00000000001c4039	retq
00000000001c403a	movq	%rax, %rdi
00000000001c403d	callq	___clang_call_terminate
00000000001c4042	nopw	%cs:(%rax,%rax)
