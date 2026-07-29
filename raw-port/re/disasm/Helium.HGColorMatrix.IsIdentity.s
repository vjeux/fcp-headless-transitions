__ZNK13HGColorMatrix10IsIdentityEv:
00000000001b7ba0	pushq	%rbp
00000000001b7ba1	movq	%rsp, %rbp
00000000001b7ba4	pushq	%rbx
00000000001b7ba5	pushq	%rax
00000000001b7ba6	movq	%rdi, %rbx
00000000001b7ba9	movaps	0x1b0(%rdi), %xmm0
00000000001b7bb0	movss	0x210108(%rip), %xmm1
00000000001b7bb8	movss	0x6a5830(%rip), %xmm2
00000000001b7bc0	callq	__ZN6HGMath22IsEqualWithinToleranceEDv4_fS0_f ## HGMath::IsEqualWithinTolerance(float vector[4], float vector[4], float)
00000000001b7bc5	testb	%al, %al
00000000001b7bc7	je	0x1b7c29
00000000001b7bc9	movaps	0x1c0(%rbx), %xmm0
00000000001b7bd0	movsd	0x2100d8(%rip), %xmm1
00000000001b7bd8	movss	0x6a5810(%rip), %xmm2
00000000001b7be0	callq	__ZN6HGMath22IsEqualWithinToleranceEDv4_fS0_f ## HGMath::IsEqualWithinTolerance(float vector[4], float vector[4], float)
00000000001b7be5	testb	%al, %al
00000000001b7be7	je	0x1b7c29
00000000001b7be9	movaps	0x1d0(%rbx), %xmm0
00000000001b7bf0	movaps	0x212e79(%rip), %xmm1
00000000001b7bf7	movss	0x6a57f1(%rip), %xmm2
00000000001b7bff	callq	__ZN6HGMath22IsEqualWithinToleranceEDv4_fS0_f ## HGMath::IsEqualWithinTolerance(float vector[4], float vector[4], float)
00000000001b7c04	testb	%al, %al
00000000001b7c06	je	0x1b7c29
00000000001b7c08	movaps	0x1e0(%rbx), %xmm0
00000000001b7c0f	movaps	0x2123ca(%rip), %xmm1
00000000001b7c16	movss	0x6a57d2(%rip), %xmm2
00000000001b7c1e	addq	$0x8, %rsp
00000000001b7c22	popq	%rbx
00000000001b7c23	popq	%rbp
00000000001b7c24	jmp	__ZN6HGMath22IsEqualWithinToleranceEDv4_fS0_f ## HGMath::IsEqualWithinTolerance(float vector[4], float vector[4], float)
00000000001b7c29	xorl	%eax, %eax
00000000001b7c2b	addq	$0x8, %rsp
00000000001b7c2f	popq	%rbx
00000000001b7c30	popq	%rbp
00000000001b7c31	retq
00000000001b7c32	nopw	%cs:(%rax,%rax)
