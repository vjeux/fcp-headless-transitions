__ZN14HGStorage3DLUTD0Ev:
0000000000074170	pushq	%rbp
0000000000074171	movq	%rsp, %rbp
0000000000074174	pushq	%rbx
0000000000074175	pushq	%rax
0000000000074176	movq	%rdi, %rbx
0000000000074179	leaq	0x995b90(%rip), %rax
0000000000074180	movq	%rax, (%rdi)
0000000000074183	movq	0x18(%rdi), %rdi
0000000000074187	testq	%rdi, %rdi
000000000007418a	je	0x74191
000000000007418c	callq	0x3c4f9a                        ## symbol stub for: __ZdaPv
0000000000074191	xorps	%xmm0, %xmm0
0000000000074194	movups	%xmm0, 0x10(%rbx)
0000000000074198	movq	%rbx, %rdi
000000000007419b	callq	__ZN8HGObjectD2Ev               ## HGObject::~HGObject()
00000000000741a0	movq	%rbx, %rdi
00000000000741a3	addq	$0x8, %rsp
00000000000741a7	popq	%rbx
00000000000741a8	popq	%rbp
00000000000741a9	jmp	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000000741ae	addb	%al, (%rax)
