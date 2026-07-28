__ZN13HGChannelCopy14SetCopyChannelEbbbb:
000000000017a670	pushq	%rbp
000000000017a671	movq	%rsp, %rbp
000000000017a674	cvtsi2ss	%esi, %xmm0
000000000017a678	cvtsi2ss	%edx, %xmm1
000000000017a67c	cvtsi2ss	%ecx, %xmm2
000000000017a680	movq	0x198(%rdi), %rdi
000000000017a687	cvtsi2ss	%r8d, %xmm3
000000000017a68c	movq	(%rdi), %rax
000000000017a68f	movq	0x60(%rax), %rax
000000000017a693	xorl	%esi, %esi
000000000017a695	popq	%rbp
000000000017a696	jmpq	*%rax
000000000017a698	nopl	(%rax,%rax)
