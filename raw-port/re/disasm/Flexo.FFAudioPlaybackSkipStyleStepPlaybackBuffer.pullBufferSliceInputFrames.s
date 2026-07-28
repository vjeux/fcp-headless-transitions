__ZN42FFAudioPlaybackSkipStyleStepPlaybackBuffer26pullBufferSliceInputFramesEP15AudioBufferList6CMTimey:
0000000000d10a90	pushq	%rbp
0000000000d10a91	movq	%rsp, %rbp
0000000000d10a94	pushq	%r15
0000000000d10a96	pushq	%r14
0000000000d10a98	pushq	%rbx
0000000000d10a99	pushq	%rax
0000000000d10a9a	movq	%rdx, %r14
0000000000d10a9d	movq	%rsi, %rbx
0000000000d10aa0	movq	%rdi, %r15
0000000000d10aa3	movq	0x188(%rdi), %rdi
0000000000d10aaa	testq	%rdi, %rdi
0000000000d10aad	je	0xd10ad4
0000000000d10aaf	movq	0xeb2a7a(%rip), %rsi
0000000000d10ab6	callq	*0xbdcc04(%rip)                 ## Objc message: -[%rdi _notifyOfFirstDrawing:]
0000000000d10abc	movq	0x188(%r15), %rdi
0000000000d10ac3	callq	*0xbdcc3f(%rip)                 ## literal pool symbol address: _objc_release
0000000000d10ac9	movq	$0x0, 0x188(%r15)
0000000000d10ad4	movq	0x178(%r15), %rdi
0000000000d10adb	movl	%r14d, %esi
0000000000d10ade	movl	$0x1, %edx
0000000000d10ae3	movq	%rbx, %rcx
0000000000d10ae6	addq	$0x8, %rsp
0000000000d10aea	popq	%rbx
0000000000d10aeb	popq	%r14
0000000000d10aed	popq	%r15
0000000000d10aef	popq	%rbp
0000000000d10af0	jmp	__ZN26FFAudioPlaybackScrubBuffer12renderFramesE6CMTimeiN15FFAudioPlayback17PlaybackDirectionEP15AudioBufferList ## FFAudioPlaybackScrubBuffer::renderFrames(CMTime, int, FFAudioPlayback::PlaybackDirection, AudioBufferList*)
0000000000d10af5	nopw	%cs:(%rax,%rax)
