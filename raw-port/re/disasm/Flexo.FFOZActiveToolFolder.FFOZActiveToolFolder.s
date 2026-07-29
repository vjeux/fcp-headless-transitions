__ZN20FFOZActiveToolFolderC1EP9OZFactoryRK8PCStringP15OZChannelFolderjj:
0000000000217260	pushq	%rbp
0000000000217261	movq	%rsp, %rbp
0000000000217264	pushq	%r14
0000000000217266	pushq	%rbx
0000000000217267	movq	%rdi, %rbx
000000000021726a	callq	__ZN23FFOZRiggedChannelFolderC1EP9OZFactoryRK8PCStringP15OZChannelFolderjj ## FFOZRiggedChannelFolder::FFOZRiggedChannelFolder(OZFactory*, PCString const&, OZChannelFolder*, unsigned int, unsigned int)
000000000021726f	leaq	0x16dceda(%rip), %rax
0000000000217276	movq	%rax, (%rbx)
0000000000217279	leaq	0x16dd1a8(%rip), %rax
0000000000217280	movq	%rax, 0x10(%rbx)
0000000000217284	leaq	0x88(%rbx), %rdi
000000000021728b	callq	0x1496dda                       ## symbol stub for: __ZN8PCStringC1Ev
0000000000217290	popq	%rbx
0000000000217291	popq	%r14
0000000000217293	popq	%rbp
0000000000217294	retq
0000000000217295	movq	%rax, %r14
0000000000217298	movq	%rbx, %rdi
000000000021729b	callq	0x149655e                       ## symbol stub for: __ZN15OZChannelFolderD2Ev
00000000002172a0	movq	%r14, %rdi
00000000002172a3	callq	0x1495d30                       ## symbol stub for: __Unwind_Resume
00000000002172a8	nopl	(%rax,%rax)
