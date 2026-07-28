__ZN19FFPlaybackStateInfo19invalidStateFactoryEv:
0000000000d725e0	pushq	%rbp
0000000000d725e1	movq	%rsp, %rbp
0000000000d725e4	movq	%rdi, %rax
0000000000d725e7	movq	0xf23de2(%rip), %rcx
0000000000d725ee	movq	%rcx, 0x40(%rdi)
0000000000d725f2	movups	0xf23dc7(%rip), %xmm0
0000000000d725f9	movups	%xmm0, 0x30(%rdi)
0000000000d725fd	movups	0xf23dac(%rip), %xmm0
0000000000d72604	movups	%xmm0, 0x20(%rdi)
0000000000d72608	movups	0xf23d91(%rip), %xmm0
0000000000d7260f	movups	%xmm0, 0x10(%rdi)
0000000000d72613	movups	__ZN19FFPlaybackStateInfo13sInvalidStateE(%rip), %xmm0 ## FFPlaybackStateInfo::sInvalidState
0000000000d7261a	movups	%xmm0, (%rdi)
0000000000d7261d	popq	%rbp
0000000000d7261e	retq
0000000000d7261f	nop
