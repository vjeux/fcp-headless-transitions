__ZN22UpdateBufferWorkerTask11performTaskEv:
0000000000d0efb0	pushq	%rbp
0000000000d0efb1	movq	%rsp, %rbp
0000000000d0efb4	movq	0x28(%rdi), %rsi
0000000000d0efb8	movq	0x10(%rdi), %rax
0000000000d0efbc	movq	0x20(%rdi), %rdx
0000000000d0efc0	movzbl	0x30(%rdi), %ecx
0000000000d0efc4	movq	%rax, %rdi
0000000000d0efc7	popq	%rbp
0000000000d0efc8	jmp	__ZN26FFAudioPlaybackScrubBuffer16readUpdateBufferEyxb ## FFAudioPlaybackScrubBuffer::readUpdateBuffer(unsigned long long, long long, bool)
0000000000d0efcd	nopl	(%rax)
