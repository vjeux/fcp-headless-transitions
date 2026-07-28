__ZN10HgcSampler7DestroyEPNS_5StateE:
00000000002d3450	pushq	%rbp
00000000002d3451	movq	%rsp, %rbp
00000000002d3454	testq	%rdi, %rdi
00000000002d3457	je	0x2d3468
00000000002d3459	movq	-0x8(%rdi), %rdi
00000000002d345d	testq	%rdi, %rdi
00000000002d3460	je	0x2d3468
00000000002d3462	popq	%rbp
00000000002d3463	jmp	0x3c4fa0                        ## symbol stub for: __ZdlPv
00000000002d3468	popq	%rbp
00000000002d3469	retq
00000000002d346a	nopw	(%rax,%rax)
