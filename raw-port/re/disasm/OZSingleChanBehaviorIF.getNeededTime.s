__ZN22OZSingleChanBehaviorIF13getNeededTimeERK6CMTime:
00000000004c5bc0	pushq	%rbp
00000000004c5bc1	movq	%rsp, %rbp
00000000004c5bc4	movq	%rdi, %rax
00000000004c5bc7	movq	0x10(%rdx), %rcx
00000000004c5bcb	movq	%rcx, 0x10(%rdi)
00000000004c5bcf	movups	(%rdx), %xmm0
00000000004c5bd2	movups	%xmm0, (%rdi)
00000000004c5bd5	popq	%rbp
00000000004c5bd6	retq
00000000004c5bd7	nopw	(%rax,%rax)
