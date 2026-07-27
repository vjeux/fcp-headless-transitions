__ZN7OZGroup8parseEndER22PCSerializerReadStream:
00000000000ee760	pushq	%rbp
00000000000ee761	movq	%rsp, %rbp
00000000000ee764	pushq	%r15
00000000000ee766	pushq	%r14
00000000000ee768	pushq	%r12
00000000000ee76a	pushq	%rbx
00000000000ee76b	subq	$0x10, %rsp
00000000000ee76f	movq	%rdi, %rbx
00000000000ee772	callq	__ZN9OZElement8parseEndER22PCSerializerReadStream ## OZElement::parseEnd(PCSerializerReadStream&)
00000000000ee777	movq	(%rbx), %rax
00000000000ee77a	movq	%rbx, %rdi
00000000000ee77d	movl	$0x1, %esi
00000000000ee782	callq	*0x6c0(%rax)
00000000000ee788	movq	%rbx, %rdi
00000000000ee78b	callq	__ZN7OZGroup26updateDimensionTypeChannelEv ## OZGroup::updateDimensionTypeChannel()
00000000000ee790	movq	(%rbx), %rax
00000000000ee793	movq	%rbx, %rdi
00000000000ee796	callq	*0x680(%rax)
00000000000ee79c	cmpl	$0x2, %eax
00000000000ee79f	jne	0xee7a9
00000000000ee7a1	movq	%rbx, %rdi
00000000000ee7a4	callq	__ZN7OZGroup21updateBlendModeFor360Ev ## OZGroup::updateBlendModeFor360()
00000000000ee7a9	leaq	0x4ea0(%rbx), %r14
00000000000ee7b0	movq	0x735d59(%rip), %r12            ## literal pool symbol address: _kCMTimeZero
00000000000ee7b7	xorpd	%xmm0, %xmm0
00000000000ee7bb	movq	%r14, %rdi
00000000000ee7be	movq	%r12, %rsi
00000000000ee7c1	callq	0x6dfa9e                        ## symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
00000000000ee7c6	movsd	%xmm0, -0x28(%rbp)
00000000000ee7cb	leaq	0x4f38(%rbx), %r15
00000000000ee7d2	xorpd	%xmm0, %xmm0
00000000000ee7d6	movq	%r15, %rdi
00000000000ee7d9	movq	%r12, %rsi
00000000000ee7dc	callq	0x6dfa9e                        ## symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
00000000000ee7e1	xorpd	%xmm1, %xmm1
00000000000ee7e5	ucomisd	-0x28(%rbp), %xmm1
00000000000ee7ea	ja	0xee7f2
00000000000ee7ec	ucomisd	%xmm0, %xmm1
00000000000ee7f0	jbe	0xee850
00000000000ee7f2	leaq	0x4b80(%rbx), %rdi
00000000000ee7f9	movq	0x735d10(%rip), %r12            ## literal pool symbol address: _kCMTimeZero
00000000000ee800	xorpd	%xmm0, %xmm0
00000000000ee804	movq	%r12, %rsi
00000000000ee807	callq	0x6dfa9e                        ## symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
00000000000ee80c	movsd	%xmm0, -0x28(%rbp)
00000000000ee811	addq	$0x4c18, %rbx                   ## imm = 0x4C18
00000000000ee818	xorpd	%xmm0, %xmm0
00000000000ee81c	movq	%rbx, %rdi
00000000000ee81f	movq	%r12, %rsi
00000000000ee822	callq	0x6dfa9e                        ## symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
00000000000ee827	movsd	%xmm0, -0x30(%rbp)
00000000000ee82c	movq	%r14, %rdi
00000000000ee82f	movq	%r12, %rsi
00000000000ee832	movsd	-0x28(%rbp), %xmm0
00000000000ee837	xorl	%edx, %edx
00000000000ee839	callq	0x6df456                        ## symbol stub for: __ZN9OZChannel8setValueERK6CMTimedb
00000000000ee83e	movq	%r15, %rdi
00000000000ee841	movq	%r12, %rsi
00000000000ee844	movsd	-0x30(%rbp), %xmm0
00000000000ee849	xorl	%edx, %edx
00000000000ee84b	callq	0x6df456                        ## symbol stub for: __ZN9OZChannel8setValueERK6CMTimedb
00000000000ee850	movb	$0x1, %al
00000000000ee852	addq	$0x10, %rsp
00000000000ee856	popq	%rbx
00000000000ee857	popq	%r12
00000000000ee859	popq	%r14
00000000000ee85b	popq	%r15
00000000000ee85d	popq	%rbp
00000000000ee85e	retq
00000000000ee85f	nop
