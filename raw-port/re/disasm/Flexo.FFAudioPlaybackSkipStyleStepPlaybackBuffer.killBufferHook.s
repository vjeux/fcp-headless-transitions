__ZN42FFAudioPlaybackSkipStyleStepPlaybackBuffer14killBufferHookEv:
0000000000d10a70	pushq	%rbp
0000000000d10a71	movq	%rsp, %rbp
0000000000d10a74	movq	0x178(%rdi), %rdi
0000000000d10a7b	testq	%rdi, %rdi
0000000000d10a7e	je	0xd10a86
0000000000d10a80	popq	%rbp
0000000000d10a81	jmp	__ZN26FFAudioPlaybackScrubBuffer10killBufferEv ## FFAudioPlaybackScrubBuffer::killBuffer()
0000000000d10a86	popq	%rbp
0000000000d10a87	retq
0000000000d10a88	nopl	(%rax,%rax)
