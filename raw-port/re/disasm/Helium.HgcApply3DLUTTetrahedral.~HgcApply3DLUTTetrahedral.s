__ZN24HgcApply3DLUTTetrahedralD0Ev:
0000000000074060	pushq	%rbp
0000000000074061	movq	%rsp, %rbp
0000000000074064	pushq	%rbx
0000000000074065	pushq	%rax
0000000000074066	movq	%rdi, %rbx
0000000000074069	callq	__ZN35HgcApply3DLUTTetrahedral_basekernelD2Ev ## HgcApply3DLUTTetrahedral_basekernel::~HgcApply3DLUTTetrahedral_basekernel()
000000000007406e	movq	%rbx, %rdi
0000000000074071	addq	$0x8, %rsp
0000000000074075	popq	%rbx
0000000000074076	popq	%rbp
0000000000074077	jmp	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
000000000007407c	nopl	(%rax)
