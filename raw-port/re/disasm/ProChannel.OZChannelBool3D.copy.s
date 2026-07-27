__ZN15OZChannelBool3D4copyEPK13OZChannelBaseb:
0000000000053562	pushq	%rbp
0000000000053563	movq	%rsp, %rbp
0000000000053566	pushq	%r15
0000000000053568	pushq	%r14
000000000005356a	pushq	%rbx
000000000005356b	pushq	%rax
000000000005356c	movl	%edx, %r14d
000000000005356f	movq	%rsi, %r15
0000000000053572	movq	%rdi, %rbx
0000000000053575	callq	__ZN17OZCompoundChannel4copyEPK13OZChannelBaseb ## OZCompoundChannel::copy(OZChannelBase const*, bool)
000000000005357a	testq	%r15, %r15
000000000005357d	je	0x5359c
000000000005357f	leaq	__ZTI13OZChannelBase(%rip), %rsi ## typeinfo for OZChannelBase
0000000000053586	leaq	__ZTI15OZChannelBool3D(%rip), %rdx ## typeinfo for OZChannelBool3D
000000000005358d	movq	%r15, %rdi
0000000000053590	xorl	%ecx, %ecx
0000000000053592	callq	0xacea0                         ## symbol stub for: ___dynamic_cast
0000000000053597	movq	%rax, %r15
000000000005359a	jmp	0x5359f
000000000005359c	xorl	%r15d, %r15d
000000000005359f	movl	$0x88, %esi
00000000000535a4	leaq	(%rbx,%rsi), %rdi
00000000000535a8	addq	%r15, %rsi
00000000000535ab	movzbl	%r14b, %r14d
00000000000535af	movl	%r14d, %edx
00000000000535b2	callq	__ZN9OZChannel4copyEPK13OZChannelBaseb ## OZChannel::copy(OZChannelBase const*, bool)
00000000000535b7	movl	$0x120, %esi                    ## imm = 0x120
00000000000535bc	leaq	(%rbx,%rsi), %rdi
00000000000535c0	addq	%r15, %rsi
00000000000535c3	movl	%r14d, %edx
00000000000535c6	callq	__ZN9OZChannel4copyEPK13OZChannelBaseb ## OZChannel::copy(OZChannelBase const*, bool)
00000000000535cb	movl	$0x1b8, %eax                    ## imm = 0x1B8
00000000000535d0	addq	%rax, %rbx
00000000000535d3	addq	%rax, %r15
00000000000535d6	movq	%rbx, %rdi
00000000000535d9	movq	%r15, %rsi
00000000000535dc	movl	%r14d, %edx
00000000000535df	addq	$0x8, %rsp
00000000000535e3	popq	%rbx
00000000000535e4	popq	%r14
00000000000535e6	popq	%r15
00000000000535e8	popq	%rbp
00000000000535e9	jmp	__ZN9OZChannel4copyEPK13OZChannelBaseb ## OZChannel::copy(OZChannelBase const*, bool)
