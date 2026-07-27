__ZN7OZGroup10parseBeginER22PCSerializerReadStream:
00000000000ee680	pushq	%rbp
00000000000ee681	movq	%rsp, %rbp
00000000000ee684	pushq	%r15
00000000000ee686	pushq	%r14
00000000000ee688	pushq	%rbx
00000000000ee689	pushq	%rax
00000000000ee68a	movq	%rsi, %r14
00000000000ee68d	movq	%rdi, %rbx
00000000000ee690	callq	__ZN9OZElement10parseBeginER22PCSerializerReadStream ## OZElement::parseBegin(PCSerializerReadStream&)
00000000000ee695	leaq	__ZL12OZGroupScope(%rip), %rsi  ## OZGroupScope
00000000000ee69c	movq	%r14, %rdi
00000000000ee69f	callq	0x6de79c                        ## symbol stub for: __ZN22PCSerializerReadStream9pushScopeEP7PCScope
00000000000ee6a4	movl	0x68(%r14), %eax
00000000000ee6a8	cmpl	$0x4, %eax
00000000000ee6ab	ja	0xee705
00000000000ee6ad	cvtsi2sd	%eax, %xmm0
00000000000ee6b1	movsd	%xmm0, -0x20(%rbp)
00000000000ee6b6	leaq	0x4ea0(%rbx), %rdi
00000000000ee6bd	movq	0x735e4c(%rip), %r15            ## literal pool symbol address: _kCMTimeZero
00000000000ee6c4	movsd	0x61905c(%rip), %xmm0
00000000000ee6cc	movq	%r15, %rsi
00000000000ee6cf	xorl	%edx, %edx
00000000000ee6d1	callq	0x6df456                        ## symbol stub for: __ZN9OZChannel8setValueERK6CMTimedb
00000000000ee6d6	leaq	0x4f38(%rbx), %rdi
00000000000ee6dd	movq	%r15, %rsi
00000000000ee6e0	movsd	0x619040(%rip), %xmm0
00000000000ee6e8	xorl	%edx, %edx
00000000000ee6ea	callq	0x6df456                        ## symbol stub for: __ZN9OZChannel8setValueERK6CMTimedb
00000000000ee6ef	leaq	0x4fd0(%rbx), %rdi
00000000000ee6f6	movq	%r15, %rsi
00000000000ee6f9	movsd	-0x20(%rbp), %xmm0
00000000000ee6fe	xorl	%edx, %edx
00000000000ee700	callq	0x6df456                        ## symbol stub for: __ZN9OZChannel8setValueERK6CMTimedb
00000000000ee705	cmpl	$0x9, 0x6c(%r14)
00000000000ee70a	ja	0xee727
00000000000ee70c	addq	$0x5068, %rbx                   ## imm = 0x5068
00000000000ee713	movq	0x735df6(%rip), %rsi            ## literal pool symbol address: _kCMTimeZero
00000000000ee71a	xorps	%xmm0, %xmm0
00000000000ee71d	movq	%rbx, %rdi
00000000000ee720	xorl	%edx, %edx
00000000000ee722	callq	0x6df456                        ## symbol stub for: __ZN9OZChannel8setValueERK6CMTimedb
00000000000ee727	movb	$0x1, %al
00000000000ee729	addq	$0x8, %rsp
00000000000ee72d	popq	%rbx
00000000000ee72e	popq	%r14
00000000000ee730	popq	%r15
00000000000ee732	popq	%rbp
00000000000ee733	retq
00000000000ee734	nopw	%cs:(%rax,%rax)
