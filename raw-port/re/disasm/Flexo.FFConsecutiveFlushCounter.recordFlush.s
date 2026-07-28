__ZN25FFConsecutiveFlushCounter11recordFlushEd:
0000000000d58d70	incl	(%rdi)
0000000000d58d72	incl	0x8(%rdi)
0000000000d58d75	incl	0x10(%rdi)
0000000000d58d78	ucomisd	%xmm0, %xmm0
0000000000d58d7c	jp	0xd58da2
0000000000d58d7e	pushq	%rbp
0000000000d58d7f	movq	%rsp, %rbp
0000000000d58d82	andpd	0x813d06(%rip), %xmm0
0000000000d58d8a	movsd	0x8142d6(%rip), %xmm1
0000000000d58d92	ucomisd	%xmm0, %xmm1
0000000000d58d96	ja	0xd58da1
0000000000d58d98	incl	0x4(%rdi)
0000000000d58d9b	incl	0xc(%rdi)
0000000000d58d9e	incl	0x14(%rdi)
0000000000d58da1	popq	%rbp
0000000000d58da2	retq
0000000000d58da3	nopw	%cs:(%rax,%rax)
