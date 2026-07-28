# Extracted via capstone from raw x86_64 slice bytes at file offset 0x10784..0x107a4
# (otool -tV emitted an empty entry due to ICF-style label collapse in the -tV
# rendering — the D1 label sits between D2 folded region and D0). Bytes are the
# ground truth (verified via nm's address for __ZN20OZChannelDecibelImplD1Ev).
__ZN20OZChannelDecibelImplD1Ev:
0x10784  pushq   %rbp
0x10785  movq    %rsp, %rbp
0x10788  pushq   %rbx
0x10789  pushq   %rax
0x1078a  movq    %rdi, %rbx
0x1078d  addq    $0x28, %rdi
0x10791  callq   0xacb4c        ## symbol stub for: __ZN11PCSingletonD2Ev
0x10796  movq    %rbx, %rdi
0x10799  addq    $0x8, %rsp
0x1079d  popq    %rbx
0x1079e  popq    %rbp
0x1079f  jmp     0xaa40a        ## OZChannelImpl::~OZChannelImpl()  (D2 base dtor)
