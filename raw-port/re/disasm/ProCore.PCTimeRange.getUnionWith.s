__ZNK11PCTimeRange12getUnionWithERKS_RK6CMTime:
000000000001fe10	pushq	%rbp
000000000001fe11	movq	%rsp, %rbp
000000000001fe14	pushq	%r15
000000000001fe16	pushq	%r14
000000000001fe18	pushq	%r13
000000000001fe1a	pushq	%r12
000000000001fe1c	pushq	%rbx
000000000001fe1d	subq	$0x128, %rsp                    ## imm = 0x128
000000000001fe24	movq	%rcx, -0x68(%rbp)
000000000001fe28	movq	%rdx, %r13
000000000001fe2b	movq	%rsi, %r14
000000000001fe2e	movq	%rdi, -0x70(%rbp)
000000000001fe32	leaq	0x18(%rdi), %rax
000000000001fe36	movq	%rax, -0x78(%rbp)
000000000001fe3a	movq	0x1279df(%rip), %rax            ## literal pool symbol address: _kCMTimeZero
000000000001fe41	movq	0x10(%rax), %rcx
000000000001fe45	movq	%rcx, 0x28(%rdi)
000000000001fe49	movups	(%rax), %xmm0
000000000001fe4c	movups	%xmm0, 0x18(%rdi)
000000000001fe50	movq	0x10(%rsi), %rax
000000000001fe54	leaq	-0xd0(%rbp), %rbx
000000000001fe5b	movq	%rax, 0x10(%rbx)
000000000001fe5f	movups	(%rsi), %xmm0
000000000001fe62	movaps	%xmm0, (%rbx)
000000000001fe65	movq	0x10(%rdx), %rax
000000000001fe69	leaq	-0xb0(%rbp), %r15
000000000001fe70	movq	%rax, 0x10(%r15)
000000000001fe74	movups	(%rdx), %xmm0
000000000001fe77	movaps	%xmm0, (%r15)
000000000001fe7b	movq	0x10(%rsi), %rax
000000000001fe7f	movq	%rax, -0x30(%rbp)
000000000001fe83	movups	(%rsi), %xmm0
000000000001fe86	movaps	%xmm0, -0x40(%rbp)
000000000001fe8a	movq	0x10(%rdx), %rax
000000000001fe8e	leaq	-0xf0(%rbp), %r12
000000000001fe95	movq	%rax, 0x10(%r12)
000000000001fe9a	movups	(%rdx), %xmm0
000000000001fe9d	movaps	%xmm0, (%r12)
000000000001fea2	movq	0x10(%r12), %rax
000000000001fea7	movq	%rax, 0x28(%rsp)
000000000001feac	movaps	(%r12), %xmm0
000000000001feb1	movups	%xmm0, 0x18(%rsp)
000000000001feb6	movq	-0x30(%rbp), %rax
000000000001feba	movq	%rax, 0x10(%rsp)
000000000001febf	movaps	-0x40(%rbp), %xmm0
000000000001fec3	movups	%xmm0, (%rsp)
000000000001fec7	callq	0xde3a8                         ## symbol stub for: _CMTimeCompare
000000000001fecc	testl	%eax, %eax
000000000001fece	cmovgq	%r15, %rbx
000000000001fed2	movups	(%rbx), %xmm0
000000000001fed5	movaps	%xmm0, -0x60(%rbp)
000000000001fed9	movq	0x10(%rbx), %rax
000000000001fedd	movq	%rax, -0x50(%rbp)
000000000001fee1	movq	0x10(%r14), %rax
000000000001fee5	movq	%rax, -0x30(%rbp)
000000000001fee9	movups	(%r14), %xmm0
000000000001feed	movaps	%xmm0, -0x40(%rbp)
000000000001fef1	movq	0x28(%r14), %rax
000000000001fef5	movq	%rax, 0x10(%r12)
000000000001fefa	movups	0x18(%r14), %xmm0
000000000001feff	movaps	%xmm0, (%r12)
000000000001ff04	movq	0x10(%r12), %rax
000000000001ff09	movq	%rax, 0x28(%rsp)
000000000001ff0e	movaps	(%r12), %xmm0
000000000001ff13	movups	%xmm0, 0x18(%rsp)
000000000001ff18	movq	-0x30(%rbp), %rax
000000000001ff1c	movq	%rax, 0x10(%rsp)
000000000001ff21	movaps	-0x40(%rbp), %xmm0
000000000001ff25	movups	%xmm0, (%rsp)
000000000001ff29	leaq	-0x90(%rbp), %r14
000000000001ff30	movq	%r14, %rdi
000000000001ff33	callq	_PC_CMTimeSaferAdd
000000000001ff38	movq	-0x68(%rbp), %r15
000000000001ff3c	movq	0x10(%r15), %rax
000000000001ff40	movq	%rax, -0x30(%rbp)
000000000001ff44	movups	(%r15), %xmm0
000000000001ff48	movaps	%xmm0, -0x40(%rbp)
000000000001ff4c	movq	-0x30(%rbp), %rax
000000000001ff50	movq	%rax, 0x28(%rsp)
000000000001ff55	movaps	-0x40(%rbp), %xmm0
000000000001ff59	movups	%xmm0, 0x18(%rsp)
000000000001ff5e	movq	0x10(%r14), %rax
000000000001ff62	movq	%rax, 0x10(%rsp)
000000000001ff67	movups	(%r14), %xmm0
000000000001ff6b	movups	%xmm0, (%rsp)
000000000001ff6f	leaq	-0x120(%rbp), %r14
000000000001ff76	movq	%r14, %rdi
000000000001ff79	callq	_PC_CMTimeSaferSubtract
000000000001ff7e	movq	0x10(%r13), %rax
000000000001ff82	movq	%rax, -0x30(%rbp)
000000000001ff86	movups	(%r13), %xmm0
000000000001ff8b	movaps	%xmm0, -0x40(%rbp)
000000000001ff8f	movq	0x28(%r13), %rax
000000000001ff93	movq	%rax, 0x10(%r12)
000000000001ff98	movups	0x18(%r13), %xmm0
000000000001ff9d	movaps	%xmm0, (%r12)
000000000001ffa2	movq	0x10(%r12), %rax
000000000001ffa7	movq	%rax, 0x28(%rsp)
000000000001ffac	movaps	(%r12), %xmm0
000000000001ffb1	movups	%xmm0, 0x18(%rsp)
000000000001ffb6	movq	-0x30(%rbp), %rax
000000000001ffba	movq	%rax, 0x10(%rsp)
000000000001ffbf	movaps	-0x40(%rbp), %xmm0
000000000001ffc3	movups	%xmm0, (%rsp)
000000000001ffc7	leaq	-0x90(%rbp), %r13
000000000001ffce	movq	%r13, %rdi
000000000001ffd1	callq	_PC_CMTimeSaferAdd
000000000001ffd6	movq	0x10(%r15), %rax
000000000001ffda	movq	%rax, -0x30(%rbp)
000000000001ffde	movups	(%r15), %xmm0
000000000001ffe2	movaps	%xmm0, -0x40(%rbp)
000000000001ffe6	movq	-0x30(%rbp), %rax
000000000001ffea	movq	%rax, 0x28(%rsp)
000000000001ffef	movaps	-0x40(%rbp), %xmm0
000000000001fff3	movups	%xmm0, 0x18(%rsp)
000000000001fff8	movq	0x10(%r13), %rax
000000000001fffc	movq	%rax, 0x10(%rsp)
0000000000020001	movups	(%r13), %xmm0
0000000000020006	movups	%xmm0, (%rsp)
000000000002000a	leaq	-0x108(%rbp), %r13
0000000000020011	movq	%r13, %rdi
0000000000020014	callq	_PC_CMTimeSaferSubtract
0000000000020019	movq	0x10(%r13), %rax
000000000002001d	movq	%rax, 0x28(%rsp)
0000000000020022	movups	(%r13), %xmm0
0000000000020027	movups	%xmm0, 0x18(%rsp)
000000000002002c	movq	0x10(%r14), %rax
0000000000020030	movq	%rax, 0x10(%rsp)
0000000000020035	movups	(%r14), %xmm0
0000000000020039	movups	%xmm0, (%rsp)
000000000002003d	callq	0xde3a8                         ## symbol stub for: _CMTimeCompare
0000000000020042	testl	%eax, %eax
0000000000020044	cmovsq	%r13, %r14
0000000000020048	movaps	-0x60(%rbp), %xmm0
000000000002004c	movq	-0x70(%rbp), %rbx
0000000000020050	movups	%xmm0, (%rbx)
0000000000020053	movq	-0x50(%rbp), %rax
0000000000020057	movq	%rax, 0x10(%rbx)
000000000002005b	movq	-0x50(%rbp), %rax
000000000002005f	movq	%rax, 0x28(%rsp)
0000000000020064	movaps	-0x60(%rbp), %xmm0
0000000000020068	movups	%xmm0, 0x18(%rsp)
000000000002006d	movq	0x10(%r14), %rax
0000000000020071	movq	%rax, 0x10(%rsp)
0000000000020076	movups	(%r14), %xmm0
000000000002007a	movups	%xmm0, (%rsp)
000000000002007e	movq	%r12, %rdi
0000000000020081	callq	_PC_CMTimeSaferSubtract
0000000000020086	movq	0x10(%r15), %rax
000000000002008a	movq	%rax, -0x30(%rbp)
000000000002008e	movups	(%r15), %xmm0
0000000000020092	movaps	%xmm0, -0x40(%rbp)
0000000000020096	movq	-0x30(%rbp), %rax
000000000002009a	movq	%rax, 0x28(%rsp)
000000000002009f	movaps	-0x40(%rbp), %xmm0
00000000000200a3	movups	%xmm0, 0x18(%rsp)
00000000000200a8	movq	0x10(%r12), %rax
00000000000200ad	movq	%rax, 0x10(%rsp)
00000000000200b2	movups	(%r12), %xmm0
00000000000200b7	movups	%xmm0, (%rsp)
00000000000200bb	movq	-0x78(%rbp), %rdi
00000000000200bf	callq	_PC_CMTimeSaferAdd
00000000000200c4	movq	%rbx, %rax
00000000000200c7	addq	$0x128, %rsp                    ## imm = 0x128
00000000000200ce	popq	%rbx
00000000000200cf	popq	%r12
00000000000200d1	popq	%r13
00000000000200d3	popq	%r14
00000000000200d5	popq	%r15
00000000000200d7	popq	%rbp
00000000000200d8	retq
00000000000200d9	nop
