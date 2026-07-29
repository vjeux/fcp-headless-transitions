__ZN11OZ360CameraC1EP7OZScene:
00000000004484b0	pushq	%rbp
00000000004484b1	movq	%rsp, %rbp
00000000004484b4	pushq	%r14
00000000004484b6	pushq	%rbx
00000000004484b7	movq	%rsi, %r14
00000000004484ba	movq	%rdi, %rbx
00000000004484bd	leaq	__ZTV13PCShared_base(%rip), %rax ## vtable for PCShared_base
00000000004484c4	addq	$0x10, %rax
00000000004484c8	movq	%rax, 0x210(%rdi)
00000000004484cf	movq	$0x0, 0x218(%rdi)
00000000004484da	leaq	0x41d5af(%rip), %rsi
00000000004484e1	callq	0x6ddc62                        ## symbol stub for: __ZN14LiSimpleCameraC2Ev
00000000004484e6	leaq	0x41d1c3(%rip), %rax
00000000004484ed	movq	%rax, (%rbx)
00000000004484f0	leaq	0x41d579(%rip), %rax
00000000004484f7	movq	%rax, 0x210(%rbx)
00000000004484fe	movq	%r14, 0x208(%rbx)
0000000000448505	movq	%rbx, %rdi
0000000000448508	xorl	%esi, %esi
000000000044850a	callq	0x6ddc4a                        ## symbol stub for: __ZN14LiSimpleCamera14setCameraModelE13LiCameraModel
000000000044850f	popq	%rbx
0000000000448510	popq	%r14
0000000000448512	popq	%rbp
0000000000448513	retq
0000000000448514	movq	%rax, %r14
0000000000448517	leaq	0x41d572(%rip), %rsi
000000000044851e	movq	%rbx, %rdi
0000000000448521	callq	0x6ddc6e                        ## symbol stub for: __ZN14LiSimpleCameraD2Ev
0000000000448526	jmp	0x44852b
0000000000448528	movq	%rax, %r14
000000000044852b	addq	$0x210, %rbx                    ## imm = 0x210
0000000000448532	movq	%rbx, %rdi
0000000000448535	callq	__ZN13PCShared_baseD2Ev         ## PCShared_base::~PCShared_base()
000000000044853a	movq	%r14, %rdi
000000000044853d	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
0000000000448542	nopw	%cs:(%rax,%rax)
