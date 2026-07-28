__ZN14HGBlendingInfo3GetEj:
0000000000025380	movzbl	__ZGVZN14HGBlendingInfo3GetEjE15s_hwblend_table(%rip), %eax ## guard variable for HGBlendingInfo::Get(unsigned int)::s_hwblend_table
0000000000025387	testb	%al, %al
0000000000025389	je	0x2539c
000000000002538b	movl	%edi, %ecx
000000000002538d	shlq	$0x5, %rcx
0000000000025391	leaq	__ZZN14HGBlendingInfo3GetEjE15s_hwblend_table(%rip), %rax ## HGBlendingInfo::Get(unsigned int)::s_hwblend_table
0000000000025398	addq	%rcx, %rax
000000000002539b	retq
000000000002539c	pushq	%rbp
000000000002539d	movq	%rsp, %rbp
00000000000253a0	pushq	%rbx
00000000000253a1	pushq	%rax
00000000000253a2	movl	%edi, %ebx
00000000000253a4	callq	__ZN14HGBlendingInfo3GetEj.cold.1 ## HGBlendingInfo::Get(unsigned int) (.cold.1)
00000000000253a9	movl	%ebx, %edi
00000000000253ab	addq	$0x8, %rsp
00000000000253af	popq	%rbx
00000000000253b0	popq	%rbp
00000000000253b1	jmp	0x2538b
00000000000253b3	nopw	%cs:(%rax,%rax)
