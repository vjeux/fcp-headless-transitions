__ZN21OZChannelColorNoAlpha4copyEPK13OZChannelBaseb:
0000000000056302	pushq	%rbp
0000000000056303	movq	%rsp, %rbp
0000000000056306	pushq	%r15
0000000000056308	pushq	%r14
000000000005630a	pushq	%rbx
000000000005630b	pushq	%rax
000000000005630c	movl	%edx, %r15d
000000000005630f	movq	%rsi, %r14
0000000000056312	movq	%rdi, %rbx
0000000000056315	callq	__ZN17OZCompoundChannel4copyEPK13OZChannelBaseb ## OZCompoundChannel::copy(OZChannelBase const*, bool)
000000000005631a	testq	%r14, %r14
000000000005631d	je	0x5633c
000000000005631f	leaq	__ZTI13OZChannelBase(%rip), %rsi ## typeinfo for OZChannelBase
0000000000056326	leaq	__ZTI21OZChannelColorNoAlpha(%rip), %rdx ## typeinfo for OZChannelColorNoAlpha
000000000005632d	movq	%r14, %rdi
0000000000056330	xorl	%ecx, %ecx
0000000000056332	callq	0xacea0                         ## symbol stub for: ___dynamic_cast
0000000000056337	movq	%rax, %r14
000000000005633a	jmp	0x5633f
000000000005633c	xorl	%r14d, %r14d
000000000005633f	movl	$0x88, %esi
0000000000056344	leaq	(%rbx,%rsi), %rdi
0000000000056348	addq	%r14, %rsi
000000000005634b	movzbl	%r15b, %r15d
000000000005634f	movl	%r15d, %edx
0000000000056352	callq	__ZN9OZChannel4copyEPK13OZChannelBaseb ## OZChannel::copy(OZChannelBase const*, bool)
0000000000056357	movl	$0x120, %esi                    ## imm = 0x120
000000000005635c	leaq	(%rbx,%rsi), %rdi
0000000000056360	addq	%r14, %rsi
0000000000056363	movl	%r15d, %edx
0000000000056366	callq	__ZN9OZChannel4copyEPK13OZChannelBaseb ## OZChannel::copy(OZChannelBase const*, bool)
000000000005636b	movl	$0x1b8, %esi                    ## imm = 0x1B8
0000000000056370	leaq	(%rbx,%rsi), %rdi
0000000000056374	addq	%r14, %rsi
0000000000056377	movl	%r15d, %edx
000000000005637a	callq	__ZN9OZChannel4copyEPK13OZChannelBaseb ## OZChannel::copy(OZChannelBase const*, bool)
000000000005637f	movl	$0x250, %esi                    ## imm = 0x250
0000000000056384	leaq	(%rbx,%rsi), %rdi
0000000000056388	addq	%r14, %rsi
000000000005638b	movl	%r15d, %edx
000000000005638e	callq	__ZN9OZChannel4copyEPK13OZChannelBaseb ## OZChannel::copy(OZChannelBase const*, bool)
0000000000056393	movl	$0x2e8, %esi                    ## imm = 0x2E8
0000000000056398	leaq	(%rbx,%rsi), %rdi
000000000005639c	addq	%r14, %rsi
000000000005639f	movl	%r15d, %edx
00000000000563a2	callq	__ZN13OZChannelEnum4copyEPK13OZChannelBaseb ## OZChannelEnum::copy(OZChannelBase const*, bool)
00000000000563a7	movb	0x3e8(%r14), %al
00000000000563ae	movb	%al, 0x3e8(%rbx)
00000000000563b4	addq	$0x8, %rsp
00000000000563b8	popq	%rbx
00000000000563b9	popq	%r14
00000000000563bb	popq	%r15
00000000000563bd	popq	%rbp
00000000000563be	retq
00000000000563bf	nop
