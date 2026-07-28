__ZN42FFAudioPlaybackSkipStyleStepPlaybackBuffer15startBufferHookE6CMTimeN15FFAudioPlayback17PlaybackDirectionEP13FFPrerollSync:
0000000000d109d0	pushq	%rbp
0000000000d109d1	movq	%rsp, %rbp
0000000000d109d4	pushq	%r15
0000000000d109d6	pushq	%r14
0000000000d109d8	pushq	%r12
0000000000d109da	pushq	%rbx
0000000000d109db	subq	$0x20, %rsp
0000000000d109df	testb	$0x1, 0x1c(%rbp)
0000000000d109e3	jne	0xd109f2
0000000000d109e5	addq	$0x20, %rsp
0000000000d109e9	popq	%rbx
0000000000d109ea	popq	%r12
0000000000d109ec	popq	%r14
0000000000d109ee	popq	%r15
0000000000d109f0	popq	%rbp
0000000000d109f1	retq
0000000000d109f2	movq	%rdi, %rbx
0000000000d109f5	cmpq	$0x0, 0x178(%rdi)
0000000000d109fd	je	0xd10a5b
0000000000d109ff	leaq	0x10(%rbp), %r12
0000000000d10a03	leaq	_OBJC_CLASS_$_FFPrerollSync(%rip), %rdi
0000000000d10a0a	movq	%rdx, %r14
0000000000d10a0d	movl	%esi, %r15d
0000000000d10a10	callq	0x14978fc                       ## symbol stub for: _objc_alloc
0000000000d10a15	movq	0xeb2b04(%rip), %rsi
0000000000d10a1c	leaq	0xc9a8c5(%rip), %rdx            ## Objc cfstring ref: @"bad cfstring ref"
0000000000d10a23	movq	%rax, %rdi
0000000000d10a26	callq	*0xbdcc94(%rip)                 ## Objc message: -[%rdi _notifyOfFirstDrawing:]
0000000000d10a2c	movq	%rax, 0x188(%rbx)
0000000000d10a33	movq	0x178(%rbx), %rdi
0000000000d10a3a	movq	0x10(%r12), %rcx
0000000000d10a3f	movq	%rcx, 0x10(%rsp)
0000000000d10a44	movups	(%r12), %xmm0
0000000000d10a49	movups	%xmm0, (%rsp)
0000000000d10a4d	movq	%rax, %rsi
0000000000d10a50	callq	__ZN26FFAudioPlaybackScrubBuffer11startBufferE6CMTimeP13FFPrerollSync ## FFAudioPlaybackScrubBuffer::startBuffer(CMTime, FFPrerollSync*)
0000000000d10a55	movl	%r15d, %esi
0000000000d10a58	movq	%r14, %rdx
0000000000d10a5b	movq	%rbx, %rdi
0000000000d10a5e	addq	$0x20, %rsp
0000000000d10a62	popq	%rbx
0000000000d10a63	popq	%r12
0000000000d10a65	popq	%r14
0000000000d10a67	popq	%r15
0000000000d10a69	popq	%rbp
0000000000d10a6a	jmp	__ZN35FFAudioPlaybackSkipStyleScrubBuffer13addUpdateTaskE6CMTimeN15FFAudioPlayback17PlaybackDirectionEP13FFPrerollSync ## FFAudioPlaybackSkipStyleScrubBuffer::addUpdateTask(CMTime, FFAudioPlayback::PlaybackDirection, FFPrerollSync*)
0000000000d10a6f	nop
