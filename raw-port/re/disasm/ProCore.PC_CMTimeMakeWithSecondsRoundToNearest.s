_PC_CMTimeMakeWithSecondsRoundToNearest:
00000000000905b7	pushq	%rbp
00000000000905b8	movq	%rsp, %rbp
00000000000905bb	pushq	%rbx
00000000000905bc	pushq	%rax
00000000000905bd	cvtsi2sd	%esi, %xmm1
00000000000905c1	movq	%rdi, %rbx
00000000000905c4	movsd	0x922c4(%rip), %xmm2
00000000000905cc	divsd	%xmm1, %xmm2
00000000000905d0	addsd	%xmm2, %xmm0
00000000000905d4	callq	0xde3cc                         ## symbol stub for: _CMTimeMakeWithSeconds
00000000000905d9	movq	%rbx, %rax
00000000000905dc	addq	$0x8, %rsp
00000000000905e0	popq	%rbx
00000000000905e1	popq	%rbp
00000000000905e2	retq
