__ZN7OZScene12setTimeRangeERK11PCTimeRange:
000000000004fa10	pushq	%rbp
000000000004fa11	movq	%rsp, %rbp
000000000004fa14	pushq	%r15
000000000004fa16	pushq	%r14
000000000004fa18	pushq	%rbx
000000000004fa19	subq	$0x68, %rsp
000000000004fa1d	movq	%rdi, %rbx
000000000004fa20	leaq	0x480(%rdi), %rax
000000000004fa27	cmpq	%rsi, %rax
000000000004fa2a	je	0x4fa50
000000000004fa2c	movq	0x10(%rsi), %rcx
000000000004fa30	movq	%rcx, 0x10(%rax)
000000000004fa34	movups	(%rsi), %xmm0
000000000004fa37	movups	%xmm0, (%rax)
000000000004fa3a	movq	0x28(%rsi), %rax
000000000004fa3e	movq	%rax, 0x4a8(%rbx)
000000000004fa45	movups	0x18(%rsi), %xmm0
000000000004fa49	movups	%xmm0, 0x498(%rbx)
000000000004fa50	movsd	0xb0(%rbx), %xmm0
000000000004fa58	xorpd	%xmm1, %xmm1
000000000004fa5c	ucomisd	%xmm1, %xmm0
000000000004fa60	jbe	0x4faf6
000000000004fa66	movl	0x24(%rsi), %eax
000000000004fa69	andl	$0x1d, %eax
000000000004fa6c	cmpl	$0x1, %eax
000000000004fa6f	jne	0x4faea
000000000004fa71	movq	%rsi, %r15
000000000004fa74	leaq	0x90(%rbx), %r14
000000000004fa7b	leaq	-0x30(%rbp), %rdi
000000000004fa7f	movq	%r14, %rsi
000000000004fa82	callq	__ZNK15OZSceneSettings16getFrameDurationEv ## OZSceneSettings::getFrameDuration() const
000000000004fa87	movl	-0x24(%rbp), %eax
000000000004fa8a	andl	$0x1d, %eax
000000000004fa8d	cmpl	$0x1, %eax
000000000004fa90	jne	0x4faea
000000000004fa92	addq	$0x18, %r15
000000000004fa96	movq	0x10(%r15), %rax
000000000004fa9a	movq	%rax, -0x40(%rbp)
000000000004fa9e	movups	(%r15), %xmm0
000000000004faa2	movaps	%xmm0, -0x50(%rbp)
000000000004faa6	leaq	-0x68(%rbp), %r15
000000000004faaa	movq	%r15, %rdi
000000000004faad	movq	%r14, %rsi
000000000004fab0	callq	__ZNK15OZSceneSettings16getFrameDurationEv ## OZSceneSettings::getFrameDuration() const
000000000004fab5	leaq	-0x30(%rbp), %rdi
000000000004fab9	leaq	-0x50(%rbp), %rsi
000000000004fabd	movq	%r15, %rdx
000000000004fac0	callq	0x6dfc42                        ## symbol stub for: __ZdvRK6CMTimeS1_
000000000004fac5	movq	-0x20(%rbp), %rax
000000000004fac9	movq	%rax, 0x10(%rsp)
000000000004face	movupd	-0x30(%rbp), %xmm0
000000000004fad3	movupd	%xmm0, (%rsp)
000000000004fad8	callq	0x6dcac2                        ## symbol stub for: _CMTimeGetSeconds
000000000004fadd	cvttsd2si	%xmm0, %rax
000000000004fae2	movl	%eax, 0xa0(%rbx)
000000000004fae8	jmp	0x4fb00
000000000004faea	leaq	0x7785c5(%rip), %rdi            ## literal pool for: "OZScene::setTimeRange range is not numeric, setting num frames to 1."
000000000004faf1	callq	0x6e00c2                        ## symbol stub for: _puts
000000000004faf6	movl	$0x1, 0xa0(%rbx)
000000000004fb00	addq	$0x68, %rsp
000000000004fb04	popq	%rbx
000000000004fb05	popq	%r14
000000000004fb07	popq	%r15
000000000004fb09	popq	%rbp
000000000004fb0a	retq
000000000004fb0b	nopl	(%rax,%rax)
