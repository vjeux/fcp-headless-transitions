__ZN11HDemosaic_1D0Ev:
00000000000ddbd0	pushq	%rbp
00000000000ddbd1	movq	%rsp, %rbp
00000000000ddbd4	pushq	%rbx
00000000000ddbd5	pushq	%rax
00000000000ddbd6	movq	%rdi, %rbx
00000000000ddbd9	callq	__ZN13HgcDemosaic_1D2Ev         ## HgcDemosaic_1::~HgcDemosaic_1()
00000000000ddbde	movq	%rbx, %rdi
00000000000ddbe1	addq	$0x8, %rsp
00000000000ddbe5	popq	%rbx
00000000000ddbe6	popq	%rbp
00000000000ddbe7	jmp	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000000ddbec	nopl	(%rax)
