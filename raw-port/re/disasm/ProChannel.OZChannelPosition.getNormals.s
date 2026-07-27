__ZN17OZChannelPosition10getNormalsERK6CMTimePdS3_P14PCMatrix44TmplIdE:
000000000007437c	pushq	%rbp
000000000007437d	movq	%rsp, %rbp
0000000000074380	pushq	%r15
0000000000074382	pushq	%r14
0000000000074384	pushq	%r13
0000000000074386	pushq	%r12
0000000000074388	pushq	%rbx
0000000000074389	subq	$0xb8, %rsp
0000000000074390	movq	%r8, %r15
0000000000074393	movq	%rcx, -0x50(%rbp)
0000000000074397	movq	%rdx, -0x48(%rbp)
000000000007439b	movq	%rsi, %r13
000000000007439e	movq	%rdi, %r12
00000000000743a1	leaq	-0x98(%rbp), %rbx
00000000000743a8	movl	$0x1, %esi
00000000000743ad	movq	%rbx, %rdi
00000000000743b0	movl	$0x32, %edx
00000000000743b5	callq	0xaca92                         ## symbol stub for: _CMTimeMake
00000000000743ba	movq	0x10(%r13), %rax
00000000000743be	movq	%rax, -0x30(%rbp)
00000000000743c2	movups	(%r13), %xmm0
00000000000743c7	movaps	%xmm0, -0x40(%rbp)
00000000000743cb	movq	0x10(%rbx), %rax
00000000000743cf	movq	%rax, 0x28(%rsp)
00000000000743d4	movups	(%rbx), %xmm0
00000000000743d7	movups	%xmm0, 0x18(%rsp)
00000000000743dc	movq	-0x30(%rbp), %rax
00000000000743e0	movq	%rax, 0x10(%rsp)
00000000000743e5	movaps	-0x40(%rbp), %xmm0
00000000000743e9	movups	%xmm0, (%rsp)
00000000000743ed	leaq	-0xb0(%rbp), %r14
00000000000743f4	movq	%r14, %rdi
00000000000743f7	callq	0xacada                         ## symbol stub for: _PC_CMTimeSaferSubtract
00000000000743fc	leaq	0x88(%r12), %rbx
0000000000074404	xorps	%xmm0, %xmm0
0000000000074407	movq	%rbx, %rdi
000000000007440a	movq	%r14, %rsi
000000000007440d	callq	__ZNK9OZChannel16getValueAsDoubleERK6CMTimed ## OZChannel::getValueAsDouble(CMTime const&, double) const
0000000000074412	movaps	%xmm0, -0x80(%rbp)
0000000000074416	addq	$0x120, %r12                    ## imm = 0x120
000000000007441d	xorps	%xmm0, %xmm0
0000000000074420	movq	%r12, %rdi
0000000000074423	movq	%r14, %rsi
0000000000074426	callq	__ZNK9OZChannel16getValueAsDoubleERK6CMTimed ## OZChannel::getValueAsDouble(CMTime const&, double) const
000000000007442b	movaps	%xmm0, -0x70(%rbp)
000000000007442f	leaq	-0x98(%rbp), %r14
0000000000074436	movl	$0x1, %esi
000000000007443b	movq	%r14, %rdi
000000000007443e	movl	$0x32, %edx
0000000000074443	callq	0xaca92                         ## symbol stub for: _CMTimeMake
0000000000074448	movq	0x10(%r13), %rax
000000000007444c	movq	%rax, -0x30(%rbp)
0000000000074450	movups	(%r13), %xmm0
0000000000074455	movaps	%xmm0, -0x40(%rbp)
0000000000074459	movq	0x10(%r14), %rax
000000000007445d	movq	%rax, 0x28(%rsp)
0000000000074462	movups	(%r14), %xmm0
0000000000074466	movups	%xmm0, 0x18(%rsp)
000000000007446b	movq	-0x30(%rbp), %rax
000000000007446f	movq	%rax, 0x10(%rsp)
0000000000074474	movapd	-0x40(%rbp), %xmm0
0000000000074479	movupd	%xmm0, (%rsp)
000000000007447e	leaq	-0xb0(%rbp), %r14
0000000000074485	movq	%r14, %rdi
0000000000074488	callq	0xacad4                         ## symbol stub for: _PC_CMTimeSaferAdd
000000000007448d	xorpd	%xmm0, %xmm0
0000000000074491	movq	%rbx, %rdi
0000000000074494	movq	%r14, %rsi
0000000000074497	callq	__ZNK9OZChannel16getValueAsDoubleERK6CMTimed ## OZChannel::getValueAsDouble(CMTime const&, double) const
000000000007449c	movapd	%xmm0, -0x60(%rbp)
00000000000744a1	xorpd	%xmm0, %xmm0
00000000000744a5	movq	%r12, %rdi
00000000000744a8	movq	%r14, %rsi
00000000000744ab	callq	__ZNK9OZChannel16getValueAsDoubleERK6CMTimed ## OZChannel::getValueAsDouble(CMTime const&, double) const
00000000000744b0	movapd	-0x70(%rbp), %xmm5
00000000000744b5	movapd	-0x80(%rbp), %xmm3
00000000000744ba	unpcklpd	-0x60(%rbp), %xmm3              ## xmm3 = xmm3[0],mem[0]
00000000000744bf	unpcklpd	%xmm0, %xmm5                    ## xmm5 = xmm5[0],xmm0[0]
00000000000744c3	testq	%r15, %r15
00000000000744c6	je	0x74535
00000000000744c8	movddup	0x60(%r15), %xmm0               ## xmm0 = mem[0,0]
00000000000744ce	mulpd	%xmm3, %xmm0
00000000000744d2	movddup	0x68(%r15), %xmm1               ## xmm1 = mem[0,0]
00000000000744d8	mulpd	%xmm5, %xmm1
00000000000744dc	addpd	%xmm0, %xmm1
00000000000744e0	movddup	0x78(%r15), %xmm0               ## xmm0 = mem[0,0]
00000000000744e6	addpd	%xmm1, %xmm0
00000000000744ea	movddup	0x20(%r15), %xmm1               ## xmm1 = mem[0,0]
00000000000744f0	movddup	(%r15), %xmm2                   ## xmm2 = mem[0,0]
00000000000744f5	mulpd	%xmm3, %xmm2
00000000000744f9	mulpd	%xmm3, %xmm1
00000000000744fd	movddup	0x28(%r15), %xmm3               ## xmm3 = mem[0,0]
0000000000074503	movddup	0x8(%r15), %xmm4                ## xmm4 = mem[0,0]
0000000000074509	mulpd	%xmm5, %xmm4
000000000007450d	addpd	%xmm2, %xmm4
0000000000074511	mulpd	%xmm5, %xmm3
0000000000074515	addpd	%xmm1, %xmm3
0000000000074519	movddup	0x38(%r15), %xmm5               ## xmm5 = mem[0,0]
000000000007451f	addpd	%xmm3, %xmm5
0000000000074523	movddup	0x18(%r15), %xmm3               ## xmm3 = mem[0,0]
0000000000074529	addpd	%xmm4, %xmm3
000000000007452d	divpd	%xmm0, %xmm5
0000000000074531	divpd	%xmm0, %xmm3
0000000000074535	movapd	%xmm3, %xmm2
0000000000074539	unpckhpd	%xmm5, %xmm2                    ## xmm2 = xmm2[1],xmm5[1]
000000000007453d	unpcklpd	%xmm5, %xmm3                    ## xmm3 = xmm3[0],xmm5[0]
0000000000074541	subpd	%xmm3, %xmm2
0000000000074545	movapd	%xmm2, %xmm0
0000000000074549	mulpd	%xmm2, %xmm0
000000000007454d	haddpd	%xmm0, %xmm0
0000000000074551	xorps	%xmm4, %xmm4
0000000000074554	sqrtsd	%xmm0, %xmm4
0000000000074558	movapd	0x3be30(%rip), %xmm1
0000000000074560	andpd	%xmm4, %xmm1
0000000000074564	movapd	%xmm2, %xmm3
0000000000074568	divsd	%xmm4, %xmm3
000000000007456c	movapd	%xmm1, %xmm0
0000000000074570	cmpltsd	0x3be37(%rip), %xmm0
0000000000074579	blendvpd	%xmm0, %xmm2, %xmm3
000000000007457e	movq	-0x48(%rbp), %rcx
0000000000074582	testq	%rcx, %rcx
0000000000074585	movq	-0x50(%rbp), %rax
0000000000074589	je	0x745b5
000000000007458b	unpckhpd	%xmm2, %xmm2                    ## xmm2 = xmm2[1,1]
000000000007458f	movapd	%xmm2, %xmm5
0000000000074593	cmpltsd	0x3be14(%rip), %xmm1
000000000007459c	divsd	%xmm4, %xmm5
00000000000745a0	movapd	%xmm1, %xmm0
00000000000745a4	blendvpd	%xmm0, %xmm2, %xmm5
00000000000745a9	xorpd	0x3c08f(%rip), %xmm5
00000000000745b1	movlpd	%xmm5, (%rcx)
00000000000745b5	testq	%rax, %rax
00000000000745b8	je	0x745be
00000000000745ba	movsd	%xmm3, (%rax)
00000000000745be	movb	$0x1, %al
00000000000745c0	addq	$0xb8, %rsp
00000000000745c7	popq	%rbx
00000000000745c8	popq	%r12
00000000000745ca	popq	%r13
00000000000745cc	popq	%r14
00000000000745ce	popq	%r15
00000000000745d0	popq	%rbp
00000000000745d1	retq
