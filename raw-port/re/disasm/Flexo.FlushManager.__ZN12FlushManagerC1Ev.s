__ZN12FlushManagerC1Ev:
0000000000ab66c0	pushq	%rbp
0000000000ab66c1	movq	%rsp, %rbp
0000000000ab66c4	movq	$0x32aaaba7, (%rdi)             ## imm = 0x32AAABA7
0000000000ab66cb	xorps	%xmm0, %xmm0
0000000000ab66ce	movups	%xmm0, 0x8(%rdi)
0000000000ab66d2	movups	%xmm0, 0x18(%rdi)
0000000000ab66d6	movups	%xmm0, 0x28(%rdi)
0000000000ab66da	movups	%xmm0, 0x38(%rdi)
0000000000ab66de	movups	%xmm0, 0x48(%rdi)
0000000000ab66e2	popq	%rbp
0000000000ab66e3	retq
0000000000ab66e4	nopw	%cs:(%rax,%rax)
